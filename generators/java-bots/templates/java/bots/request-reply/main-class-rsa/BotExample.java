import authentication.SymBotRSAAuth;
import clients.SymBotClient;
import configuration.SymConfig;
import configuration.SymConfigLoader;
import exceptions.SymClientException;
import listeners.IMListener;
import listeners.RoomListener;
import model.*;
import org.apache.log4j.BasicConfigurator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import services.DatafeedEventsService;
import javax.ws.rs.core.NoContentException;
import java.net.URL;
import java.util.Date;

public class BotExample {
    private static final Logger LOG = LoggerFactory.getLogger(BotExample.class);

    public static void main(String[] args) {
        new BotExample();
    }

    public BotExample() {
        BasicConfigurator.configure();
        URL url = getClass().getResource("config.json");
        SymConfig config = SymConfigLoader.loadFromFile(url.getPath());
        SymBotRSAAuth botAuth = new SymBotRSAAuth(config);
        botAuth.authenticate();
        SymBotClient botClient = SymBotClient.initBot(config, botAuth);
        DatafeedEventsService datafeedEventsService = botClient.getDatafeedEventsService();
        RoomListener roomListenerTest = new RoomListenerTestImpl(botClient);
        datafeedEventsService.addRoomListener(roomListenerTest);
        IMListener imListener = new IMListenerImpl(botClient);
        datafeedEventsService.addIMListener(imListener);

        // functionTest(botClient);
    }

    private void functionTest(SymBotClient botClient) {
        String testEmail = "test@example.com";
        UserInfo userInfo;
        try {
            userInfo = botClient.getUsersClient().getUserFromEmail(testEmail, true);
        } catch (NoContentException e) {
            LOG.error("User with this email does not exist: {}", testEmail);
            return;
        }

        // Get user IM and send message
        String IMStreamId = botClient.getStreamsClient().getUserIMStreamId(userInfo.getId());
        OutboundMessage message = new OutboundMessage();
        message.setMessage("test IM");
        botClient.getMessagesClient().sendMessage(IMStreamId, message);

        // Create room
        Room room = new Room();
        room.setName("Test Room with " + userInfo.getDisplayName());
        room.setDescription("Test Room Description with " + userInfo.getDisplayName());
        room.setDiscoverable(true);
        room.setPublic(true);
        room.setViewHistory(true);
        RoomInfo roomInfo;
        try {
            roomInfo = botClient.getStreamsClient().createRoom(room);
        } catch (SymClientException e) {
            LOG.error(e.getMessage());
            return;
        }
        botClient.getStreamsClient().addMemberToRoom(roomInfo.getRoomSystemInfo().getId(), userInfo.getId());

        // Update room
        Room newRoomInfo = new Room();
        newRoomInfo.setName("Test Room with " + userInfo.getDisplayName() + " Updated at " + new Date().getTime());
        botClient.getStreamsClient().updateRoom(roomInfo.getRoomSystemInfo().getId(), newRoomInfo);

        // Promote room owner
        botClient.getStreamsClient().promoteUserToOwner(roomInfo.getRoomSystemInfo().getId(), userInfo.getId());

        // Get room members
        botClient.getStreamsClient()
            .getRoomMembers(roomInfo.getRoomSystemInfo().getId())
            .forEach(m -> LOG.info("Room Member: {}", m.getId()));
    }
}
