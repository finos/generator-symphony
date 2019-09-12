import clients.SymBotClient;
import org.apache.log4j.BasicConfigurator;

public class ElementsBot {
    public static void main(String[] args) {
        new ElementsBot();
    }

    public ElementsBot() {
        BasicConfigurator.configure();

        SymBotClient botClient = SymBotClient.initBotRsa("config.json");

        botClient.getDatafeedEventsService().addListeners(
            new IMListenerImpl(botClient),
            new ElementsListenerImpl(botClient)
        );
    }
}
