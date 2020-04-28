import clients.SymBotClient;
import listeners.RoomListener;
import model.InboundMessage;
import model.OutboundMessage;
import model.Stream;
import model.events.*;

public class RoomListenerImpl implements RoomListener {
    private SymBotClient botClient;

    public RoomListenerImpl(SymBotClient botClient) {
        this.botClient = botClient;
    }

    public void onRoomMessage(InboundMessage msg) {
        OutboundMessage msgOut = new OutboundMessage("Hi " + msg.getUser().getFirstName() + "!");
        botClient.getMessagesClient().sendMessage(msg.getStream().getStreamId(), msgOut);
    }

    public void onUserJoinedRoom(UserJoinedRoom userJoinedRoom) {
        OutboundMessage msgOut = new OutboundMessage("Welcome " + userJoinedRoom.getAffectedUser().getFirstName() + "!");
        botClient.getMessagesClient().sendMessage(userJoinedRoom.getStream().getStreamId(), msgOut);
    }

    public void onRoomCreated(RoomCreated roomCreated) {}

    public void onRoomDeactivated(RoomDeactivated roomDeactivated) {}

    public void onRoomMemberDemotedFromOwner(RoomMemberDemotedFromOwner roomMemberDemotedFromOwner) {}

    public void onRoomMemberPromotedToOwner(RoomMemberPromotedToOwner roomMemberPromotedToOwner) {}

    public void onRoomReactivated(Stream stream) {}

    public void onRoomUpdated(RoomUpdated roomUpdated) {}

    public void onUserLeftRoom(UserLeftRoom userLeftRoom) {}
}
