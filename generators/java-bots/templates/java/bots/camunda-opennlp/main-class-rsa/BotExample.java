import authentication.ISymAuth;
import authentication.SymBotAuth;
import authentication.SymBotRSAAuth;
import clients.SymBotClient;
import configuration.SymConfig;
import configuration.SymConfigLoader;
import exceptions.SymClientException;
import listeners.IMListener;
import listeners.RoomListener;
import model.*;
import org.apache.log4j.BasicConfigurator;
import org.camunda.bpm.client.ExternalTaskClient;
import pricing.PricingClient;
import pricing.model.News;
import pricing.model.Quote;
import pricing.model.Securities;
import pricing.model.Security;
import services.DatafeedEventsService;

import java.net.URL;
import java.util.List;

public class BotExample {

    public static void main(String [] args) {
        BotExample app = new BotExample();
    }


    public BotExample() {
        BasicConfigurator.configure();

        URL url = getClass().getResource("config.json");
        SymConfigLoader configLoader = new SymConfigLoader();
        SymConfig config = configLoader.loadFromFile(url.getPath());
        ISymAuth botAuth = new SymBotRSAAuth(config);
        botAuth.authenticate();
        SymBotClient botClient = SymBotClient.initBot(config, botAuth);
        DatafeedEventsService datafeedEventsService = botClient.getDatafeedEventsService();
        IMListener imListener = new IMListenerImpl(botClient);
        datafeedEventsService.addIMListener(imListener);

        ExternalTaskClient client = ExternalTaskClient.create()
                .baseUrl("http://localhost:8080/engine-rest")
                .build();

        client.subscribe("confirmation-message")
                .lockDuration(1000)
                .handler((externalTask, externalTaskService) -> {
                    String streamId = externalTask.getVariable("streamId").toString();
                    String product =externalTask.getVariable("product").toString();
                    String security = getSecurity(product);
                    OutboundMessage outboundMessage = new OutboundMessage();
                    if(security!=null) {
                        Quote quote = PricingClient.getQuote(security);
                        outboundMessage.setMessage("Current price is {price}. Confirm BUY {quantity} <cash tag=\"{security}\"/>?".replace("{quantity}",externalTask.getVariable("quantity").toString()).replace("{security}",security.toUpperCase()).replace("{price}",Double.toString(quote.getLatestPrice())));
                    }
                    else{
                        outboundMessage.setMessage("Could not find symbol. Try again.");
                    }

                    try {
                        botClient.getMessagesClient().sendMessage(streamId.replace("%","_"),outboundMessage);
                        externalTaskService.complete(externalTask);
                    } catch (SymClientException e) {
                        e.printStackTrace();
                    }


                }).open();
        client.subscribe("confirm-order")
                .lockDuration(1000)
                .handler((externalTask, externalTaskService) -> {

                    String streamId = externalTask.getVariable("streamId").toString();
                    OutboundMessage outboundMessage = new OutboundMessage();
                    outboundMessage.setMessage("Order confirmed");
                    try {
                        botClient.getMessagesClient().sendMessage(streamId.replace("%","_"),outboundMessage);
                    } catch (SymClientException e) {
                        e.printStackTrace();
                    }
                    externalTaskService.complete(externalTask);

                }).open();
        client.subscribe("cancel-order")
                .lockDuration(1000)
                .handler((externalTask, externalTaskService) -> {

                    String streamId = externalTask.getVariable("streamId").toString();
                    OutboundMessage outboundMessage = new OutboundMessage();
                    outboundMessage.setMessage("Order cancelled");
                    try {
                        botClient.getMessagesClient().sendMessage(streamId.replace("%","_"),outboundMessage);
                        externalTaskService.complete(externalTask);

                    } catch (SymClientException e) {
                        e.printStackTrace();
                    }
                    
                }).open();

        client.subscribe("headlines")
                .lockDuration(1000)
                .handler((externalTask, externalTaskService) -> {

                    String streamId = externalTask.getVariable("streamId").toString();
                    OutboundMessage outboundMessage = new OutboundMessage();
                    String product = externalTask.getVariable("product").toString();
                    String security = getSecurity(product).toUpperCase();
                    if(security!=null){
                        List<News> news = PricingClient.getNews(security);
                        StringBuilder messageBuilder = new StringBuilder("<cash tag=\"{security}\"/> headlines:<br/><ul>".replace("{security}", security));
                        for (News article : news) {
                            messageBuilder.append("<li><a href=\"" + article.getUrl() + "\">" + article.getHeadline().replace("&", "&amp;") + "</a></li>");
                        }
                        messageBuilder.append("</ul>");


                        outboundMessage.setMessage(messageBuilder.toString());
                    }
                    else {
                        outboundMessage.setMessage("No news found.");
                    }


                    try {
                        botClient.getMessagesClient().sendMessage(streamId.replace("%","_"),outboundMessage);
                    } catch (SymClientException e) {
                        e.printStackTrace();
                    }
                    externalTaskService.complete(externalTask);

                }).open();

    }


    private String getSecurity(String product){
        Quote quote = null;
            if(PricingClient.getQuote(product)!=null){
                return product;
            }
            Security sec = PricingClient.symbolLookup(product);
            if (sec != null) {
                quote= PricingClient.getQuote(sec.getSymbol());
                if(quote!=null) {
                    return sec.getSymbol();
                }
            }
            List<Security> securities = PricingClient.companyLookup(product);
            if (securities != null) {
                for (Security sect: securities) {
                    quote= PricingClient.getQuote(sect.getSymbol());
                    if(quote!=null) {
                        return sect.getSymbol();
                    }
                }
            }

        return null;
    }

}
