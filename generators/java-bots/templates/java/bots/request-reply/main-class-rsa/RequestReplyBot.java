import clients.SymBotClient;
import org.apache.log4j.BasicConfigurator;

public class RequestReplyBot {
    public static void main(String[] args) {
        new RequestReplyBot();
    }

    public RequestReplyBot() {
        BasicConfigurator.configure();

        SymBotClient botClient = SymBotClient.initBotRsa("config.json");

        botClient.getDatafeedEventsService().addListeners(
            new IMListenerImpl(botClient),
            new RoomListenerImpl(botClient)
        );
    }
}
