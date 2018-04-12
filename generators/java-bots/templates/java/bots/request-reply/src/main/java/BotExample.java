import authentication.SymBotAuth;
import clients.SymBotClient;
import configuration.SymConfig;
import configuration.SymConfigLoader;
import listeners.IMListener;
import listeners.RoomListener;
import model.Room;
import model.RoomInfo;
import model.RoomMember;
import model.UserInfo;
import services.DatafeedEventsService;
import javax.ws.rs.core.NoContentException;

import java.net.URL;
import java.util.List;

public class BotExample {



    public static void main(String [] args) {
        BotExample app = new BotExample();
    }


    public BotExample() {
        URL url = getClass().getResource("config.json");
        SymConfigLoader configLoader = new SymConfigLoader();
        SymConfig config = configLoader.loadFromFile(url.getPath());
        SymBotAuth botAuth = new SymBotAuth(config);
        botAuth.authenticate();
        SymBotClient botClient = SymBotClient.initBot(config, botAuth);
        DatafeedEventsService datafeedEventsService = botClient.getDatafeedEventsService();
        RoomListener roomListenerTest = new RoomListenerTestImpl(botClient);
        datafeedEventsService.addRoomListener(roomListenerTest);
        IMListener imListener = new IMListenerImpl(botClient);
        datafeedEventsService.addIMListener(imListener);
        //createRoom(botClient);

    }

    private void createRoom(SymBotClient botClient){
        Room room = new Room();
        room.setName("test room");
        room.setDescription("test");
        room.setDiscoverable(true);
        room.setPublic(true);
        room.setViewHistory(true);
        RoomInfo roomInfo = botClient.getStreamsClient().createRoom(room);
        try {
            UserInfo userInfo = botClient.getUsersClient().getUserFromEmail("manuela.caicedo@symphony.com", true);

            botClient.getStreamsClient().addMemberToRoom(roomInfo.getRoomSystemInfo().getId(),userInfo.getId());

            //botClient.getStreamsClient().removeMemberFromRoom(roomInfo.getRoomSystemInfo().getId(),userInfo.getId());
            //RoomInfo info = botClient.getStreamsClient().getRoomInfo("Wze-a3RrwDHOzauDbAF_Fn___p1XcTJCdA");
//            Room newRoomInfo = new Room();
//            newRoomInfo.setName("test new name");
//            botClient.getStreamsClient().updateRoom(info.getRoomSystemInfo().getId(),newRoomInfo);

            //DOESNT WORK
            //StreamInfo info = botClient.getStreamsClient().getStreamInfo("Wze-a3RrwDHOzauDbAF_Fn___p1XcTJCdA");

            List<RoomMember> members =  botClient.getStreamsClient().getRoomMembers(roomInfo.getRoomSystemInfo().getId());
            for (RoomMember member:members) {
                if(member.getId().equals(botClient.getBotUserInfo().getId()))
                    System.out.println("bot is owner");
            }
            botClient.getStreamsClient().promoteUserToOwner(roomInfo.getRoomSystemInfo().getId(), userInfo.getId());
            botClient.getStreamsClient().demoteUserFromOwner(roomInfo.getRoomSystemInfo().getId(), userInfo.getId());

            botClient.getStreamsClient().deactivateRoom(roomInfo.getRoomSystemInfo().getId());

            //get user IM and send message
//            String IMStreamId = botClient.getStreamsClient().getUserIMStreamId(userInfo.getId());
//            OutboundMessage message = new OutboundMessage();
//            message.setMessage("<messageML>test IM</messageML>");
//            botClient.getMessagesClient().sendMessage(IMStreamId,message);
        } catch (NoContentException e) {
            e.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
