import authentication.SymBotAuth;
import clients.SymBotClient;
import configuration.SymConfig;
import configuration.SymConfigLoader;
import org.apache.log4j.BasicConfigurator;
import services.DatafeedEventsService;
import java.net.URL;

public class RequestReplyBot {
    public static void main(String[] args) {
        new RequestReplyBot();
    }

    public RequestReplyBot() {
        BasicConfigurator.configure();

        SymBotClient botClient = SymBotClient.initBot("config.json");

        botClient.getDatafeedEventsService().addListeners(
            new IMListenerImpl(botClient),
            new RoomListenerImpl(botClient)
        );
    }
}
