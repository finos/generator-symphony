import authentication.SymBotRSAAuth;
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
        URL url = getClass().getResource("config.json");
        SymConfig config = SymConfigLoader.loadFromFile(url.getPath());
        SymBotRSAAuth botAuth = new SymBotRSAAuth(config);
        botAuth.authenticate();
        SymBotClient botClient = SymBotClient.initBot(config, botAuth);
        DatafeedEventsService datafeedEventsService = botClient.getDatafeedEventsService();
        datafeedEventsService.addRoomListener(new RoomListenerImpl(botClient));
        datafeedEventsService.addIMListener(new IMListenerImpl(botClient));
    }
}
