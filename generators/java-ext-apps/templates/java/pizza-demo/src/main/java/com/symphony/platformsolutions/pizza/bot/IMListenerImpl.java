package com.symphony.platformsolutions.pizza.bot;

import clients.SymBotClient;
import listeners.IMListener;
import model.InboundMessage;
import model.OutboundMessage;
import model.Stream;

public class IMListenerImpl implements IMListener {
    private SymBotClient botClient;

    public IMListenerImpl(SymBotClient botClient) {
        this.botClient = botClient;
    }

    public void onIMMessage(InboundMessage inboundMessage) {
        OutboundMessage message;
        if (inboundMessage.getMessageText().equalsIgnoreCase("/menu"))
            message = PizzaController.getMenuMessage();
        else
            message = PizzaController.getHelpMessage();

        this.botClient.getMessagesClient().sendMessage(inboundMessage.getStream().getStreamId(), message);
    }

    public void onIMCreated(Stream stream) {}
}
