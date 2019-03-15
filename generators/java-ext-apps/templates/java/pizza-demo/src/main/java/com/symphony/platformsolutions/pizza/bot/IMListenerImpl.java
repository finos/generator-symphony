package com.symphony.platformsolutions.pizza.bot;

import clients.SymBotClient;
import listeners.IMListener;
import model.InboundMessage;
import model.Stream;

public class IMListenerImpl implements IMListener {
    private SymBotClient botClient;

    public IMListenerImpl(SymBotClient botClient) {
        this.botClient = botClient;
    }

    public void onIMMessage(InboundMessage inboundMessage) {
        if (inboundMessage.getMessageText().equalsIgnoreCase("/menu"))
            this.botClient.getMessagesClient().sendMessage(inboundMessage.getStream().getStreamId(), PizzaController.getMenuMessage());
    }

    public void onIMCreated(Stream stream) {}
}
