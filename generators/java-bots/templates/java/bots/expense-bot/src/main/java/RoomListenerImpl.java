import listeners.RoomListener;
import model.InboundMessage;
import model.Stream;
import model.events.*;

public class RoomListenerImpl implements RoomListener {
    private MessageProcessor messageProcessor;

    public RoomListenerImpl(MessageProcessor messageProcessor) {
        this.messageProcessor = messageProcessor;
    }

    public void onRoomMessage(InboundMessage inboundMessage) {
        this.messageProcessor.process(inboundMessage);
    }

    public void onUserJoinedRoom(UserJoinedRoom userJoinedRoom) {}

    public void onRoomCreated(RoomCreated roomCreated) {}

    public void onRoomDeactivated(RoomDeactivated roomDeactivated) {}

    public void onRoomMemberDemotedFromOwner(RoomMemberDemotedFromOwner roomMemberDemotedFromOwner) {}

    public void onRoomMemberPromotedToOwner(RoomMemberPromotedToOwner roomMemberPromotedToOwner) {}

    public void onRoomReactivated(Stream stream) {}

    public void onRoomUpdated(RoomUpdated roomUpdated) {}

    public void onUserLeftRoom(UserLeftRoom userLeftRoom) {}
}
