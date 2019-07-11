import authentication.ISymAuth;
import authentication.SymBotAuth;
import clients.SymBotClient;
import configuration.SymConfig;
import configuration.SymConfigLoader;
import model.OutboundMessage;
import org.apache.log4j.BasicConfigurator;
import org.apache.log4j.Level;
import org.camunda.bpm.client.ExternalTaskClient;
import org.camunda.bpm.client.task.ExternalTask;
import org.camunda.bpm.client.task.ExternalTaskHandler;
import pricing.IEXClient;
import pricing.model.News;
import pricing.model.Quote;
import services.DatafeedEventsService;
import java.net.URL;
import java.util.List;
import java.util.stream.Collectors;

public class NLPBot {
    private SymBotClient botClient;

    public static void main(String[] args) {
        new NLPBot();
    }

    public NLPBot() {
        BasicConfigurator.configure();
        org.apache.log4j.Logger.getRootLogger().setLevel(Level.INFO);

        SymBotClient botClient = SymBotClient.initBot("config.json");

        botClient.getDatafeedEventsService().addListeners(
            new IMListenerImpl(botClient),
            new RoomListenerImpl(botClient)
        );

        ExternalTaskClient client = ExternalTaskClient.create()
            .lockDuration(20L)
            .maxTasks(1)
            .disableBackoffStrategy()
            .baseUrl("http://localhost:8080/engine-rest")
            .build();

        ExternalTaskHandler confirmationMessageHandler = (externalTask, externalTaskService) -> {
            String streamId = externalTask.getVariable("streamId").toString();
            String product = externalTask.getVariable("product").toString().substring(1);
            String quantity = externalTask.getVariable("quantity").toString();

            Quote quote = IEXClient.getQuote(product);
            if (quote != null) {
                String price = String.format("%.3f", quote.getLatestPrice());
                String company = quote.getCompanyName();
                String template = "Current price of %s is %s. Confirm BUY %s <cash tag=\"%s\"/>?";
                sendMessage(externalTask, String.format(template, company, price, quantity, product.toUpperCase()));

                externalTaskService.complete(externalTask);
            } else {
                sendMessage(externalTask, "Could not find symbol. Try again.");
                imListener.deleteProcessInstance(streamId);
            }
        };

        ExternalTaskHandler confirmOrderHandler = (externalTask, externalTaskService) -> {
            sendMessage(externalTask, "Order confirmed");
            externalTaskService.complete(externalTask);
        };

        ExternalTaskHandler cancelOrderHandler = (externalTask, externalTaskService) -> {
            sendMessage(externalTask, "Order cancelled");
            externalTaskService.complete(externalTask);
        };

        ExternalTaskHandler headlinesHandler = (externalTask, externalTaskService) -> {
            String streamId = externalTask.getVariable("streamId").toString();
            String product = externalTask.getVariable("product").toString().substring(1);
            List<News> news = IEXClient.getNews(product);

            if (news != null) {
                String newsList = news.stream()
                    .map(article -> String.format("<li><a href=\"%s\">%s</a></li>",
                        article.getUrl(), article.getHeadline())
                    )
                    .collect(Collectors.joining(""))
                    .replaceAll("&", "&amp;");
                String newsML = String.format("<cash tag=\"%s\"/> headlines:<ul>%s</ul>", product, newsList);
                sendMessage(externalTask, newsML);
                externalTaskService.complete(externalTask);
            } else {
                sendMessage(externalTask, "No news found.");
                imListener.deleteProcessInstance(streamId);
            }
        };

        client.subscribe("confirmation-message").handler(confirmationMessageHandler).open();
        client.subscribe("confirm-order").handler(confirmOrderHandler).open();
        client.subscribe("cancel-order").handler(cancelOrderHandler).open();
        client.subscribe("headlines").handler(headlinesHandler).open();
    }

    private void sendMessage(ExternalTask externalTask, String message) {
        String streamId = externalTask.getVariable("streamId")
            .toString().replace("%", "_");
        botClient.getMessagesClient().sendMessage(streamId, new OutboundMessage(message));
    }
}
