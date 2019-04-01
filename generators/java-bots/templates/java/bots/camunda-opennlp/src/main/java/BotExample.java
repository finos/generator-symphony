import authentication.ISymAuth;
import authentication.SymBotRSAAuth;
import clients.SymBotClient;
import configuration.SymConfig;
import configuration.SymConfigLoader;
import exceptions.SymClientException;
import listeners.IMListener;
import model.OutboundMessage;
import org.apache.log4j.BasicConfigurator;
import org.camunda.bpm.client.ExternalTaskClient;
import org.camunda.bpm.client.task.ExternalTask;
import org.camunda.bpm.client.task.ExternalTaskService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pricing.PricingClient;
import pricing.model.News;
import pricing.model.Quote;
import pricing.model.Security;
import services.DatafeedEventsService;
import java.net.URL;
import java.util.List;
import java.util.stream.Collectors;

public class BotExample {
    private static final String CAMUNDA_URL = "http://localhost:8080/engine-rest";
    private SymBotClient botClient;
    private Logger LOG = LoggerFactory.getLogger(BotExample.class);

    public static void main(String[] args) {
        new BotExample();
    }

    public BotExample() {
        BasicConfigurator.configure();
        URL url = getClass().getResource("config.json");
        SymConfig config = SymConfigLoader.loadFromFile(url.getPath());
        ISymAuth botAuth = new SymBotRSAAuth(config);
        botAuth.authenticate();
        botClient = SymBotClient.initBot(config, botAuth);
        DatafeedEventsService datafeedEventsService = botClient.getDatafeedEventsService();
        IMListener imListener = new IMListenerImpl(botClient);
        datafeedEventsService.addIMListener(imListener);

        ExternalTaskClient client = ExternalTaskClient.create().baseUrl(CAMUNDA_URL).build();
        client.subscribe("confirmation-message").handler(this::handleConfirmationMessage).open();
        client.subscribe("confirm-order").handler(this::handleConfirmOrder).open();
        client.subscribe("cancel-order").handler(this::handleCancelOrder).open();
        client.subscribe("headlines").handler(this::handleHeadlines).open();
    }

    private void handleConfirmationMessage(ExternalTask externalTask, ExternalTaskService externalTaskService) {
        LOG.info("Received message on confirmation-message topic");
        String streamId = externalTask.getVariable("streamId").toString();
        String product = externalTask.getVariable("product").toString();
        String security = getSecurity(product);
        OutboundMessage outboundMessage = new OutboundMessage();
        if (security != null) {
            Quote quote = PricingClient.getQuote(security);
            if (quote == null) {
                return;
            }
            double price = quote.getLatestPrice();
            String quantity = externalTask.getVariable("quantity");
            String messageML = String.format("Current price is %.3f. Confirm BUY %s <cash tag=\"%s\"/>?", price, quantity, security.toUpperCase());
            outboundMessage.setMessage(messageML);
        } else {
            outboundMessage.setMessage("Could not find symbol. Try again.");
        }

        try {
            botClient.getMessagesClient().sendMessage(streamId.replace("%", "_"), outboundMessage);
            externalTaskService.complete(externalTask);
        } catch (SymClientException e) {
            e.printStackTrace();
        }
    }

    private void handleConfirmOrder(ExternalTask externalTask, ExternalTaskService externalTaskService) {
        LOG.info("Received message on confirm-order topic");
        String streamId = externalTask.getVariable("streamId").toString();
        OutboundMessage outboundMessage = new OutboundMessage();
        outboundMessage.setMessage("Order confirmed");
        try {
            botClient.getMessagesClient().sendMessage(streamId.replace("%", "_"), outboundMessage);
        } catch (SymClientException e) {
            e.printStackTrace();
        }
        externalTaskService.complete(externalTask);
    }

    private void handleCancelOrder(ExternalTask externalTask, ExternalTaskService externalTaskService) {
        LOG.info("Received message on cancel-order topic");
        String streamId = externalTask.getVariable("streamId").toString();
        OutboundMessage outboundMessage = new OutboundMessage();
        outboundMessage.setMessage("Order cancelled");
        try {
            botClient.getMessagesClient().sendMessage(streamId.replace("%", "_"), outboundMessage);
            externalTaskService.complete(externalTask);

        } catch (SymClientException e) {
            e.printStackTrace();
        }
    }

    private void handleHeadlines(ExternalTask externalTask, ExternalTaskService externalTaskService) {
        LOG.info("Received message on headlines topic");
        String streamId = externalTask.getVariable("streamId").toString();
        OutboundMessage outboundMessage = new OutboundMessage();
        String product = externalTask.getVariable("product").toString();
        String security = getSecurity(product);

        if (security != null) {
            security = security.toUpperCase();
            List<News> news = PricingClient.getNews(security);

            if (news != null) {
                String newsML = news.stream().map(article -> {
                    String headline = article.getHeadline().replace("&", "&amp;");
                    return String.format("<li><a href=\"%s\">%s</a></li>", article.getUrl(), headline);
                }).collect(Collectors.joining(""));
                String messageML = String.format("<cash tag=\"%s\"/> headlines:<br/><ul>%s</ul>", security, newsML);

                outboundMessage.setMessage(messageML);
            }
        } else {
            outboundMessage.setMessage("No news found.");
        }

        try {
            botClient.getMessagesClient().sendMessage(streamId.replace("%", "_"), outboundMessage);
        } catch (SymClientException e) {
            e.printStackTrace();
        }
        externalTaskService.complete(externalTask);
    }

    private String getSecurity(String product) {
        Quote quote;
        if (PricingClient.getQuote(product) != null) {
            return product;
        }
        Security sec = PricingClient.symbolLookup(product);
        if (sec != null) {
            quote = PricingClient.getQuote(sec.getSymbol());
            if (quote != null) {
                return sec.getSymbol();
            }
        }
        List<Security> securities = PricingClient.companyLookup(product);
        if (securities != null) {
            for (Security sect : securities) {
                quote = PricingClient.getQuote(sect.getSymbol());
                if (quote != null) {
                    return sect.getSymbol();
                }
            }
        }
        return null;
    }
}
