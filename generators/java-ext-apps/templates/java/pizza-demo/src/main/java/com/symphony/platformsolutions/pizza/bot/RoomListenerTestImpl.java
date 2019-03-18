package com.symphony.platformsolutions.pizza.bot;

import clients.SymBotClient;
import listeners.RoomListener;
import model.InboundMessage;
import model.Stream;
import model.events.*;

public class RoomListenerTestImpl implements RoomListener {
    private SymBotClient botClient;

    public RoomListenerTestImpl(SymBotClient botClient) {
        this.botClient = botClient;
    }

    public void onRoomMessage(InboundMessage inboundMessage) {
        if (inboundMessage.getMessageText().equalsIgnoreCase("/menu"))
            this.botClient.getMessagesClient().sendMessage(inboundMessage.getStream().getStreamId(), PizzaController.getMenuMessage());
    }

    public void onRoomCreated(RoomCreated roomCreated) {}
    public void onRoomDeactivated(RoomDeactivated roomDeactivated) {}
    public void onRoomMemberDemotedFromOwner(RoomMemberDemotedFromOwner roomMemberDemotedFromOwner) {}
    public void onRoomMemberPromotedToOwner(RoomMemberPromotedToOwner roomMemberPromotedToOwner) {}
    public void onRoomReactivated(Stream stream) {}
    public void onRoomUpdated(RoomUpdated roomUpdated) {}
    public void onUserJoinedRoom(UserJoinedRoom userJoinedRoom) {}
    public void onUserLeftRoom(UserLeftRoom userLeftRoom) {}
}
