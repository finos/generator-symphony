package com.symphony.platformsolutions.pizza.bot;

import com.symphony.platformsolutions.pizza.web.WebController;
import model.OutboundMessage;
import java.security.SecureRandom;

class PizzaController {
    private static SecureRandom random = new SecureRandom();
    private static final String chars = "0123456789abcdefghijklmnopqrstuvwxyz";
    private static final String helpML = "Hey to get the menu, use /menu";
    private static final String menuML = "<div class=\"entity\" data-entity-id=\"pizza-menu\"><b><i>Please install A Pizza App to render this entity.</i></b></div>";
    private static final String menuData = "{\"pizza-menu\": { \"type\": \"com.symphony.ps.pizzaMenu\", \"version\": \"1.0\", \"options\": [\"$menu\"], \"quoteId\": \"$quoteId\" }}";

    static OutboundMessage getMenuMessage() {
        String data = menuData
            .replace("$quoteId", randomString())
            .replace("$menu", String.join("\",\"", WebController.getMenuOptions()));
        return getMessage(menuML, data);
    }

    static OutboundMessage getHelpMessage() {
        return getMessage(helpML, null);
    }

    private static OutboundMessage getMessage(String messageText, String data) {
        OutboundMessage message = new OutboundMessage();
        message.setMessage(messageText);
        if (data != null)
            message.setData(data);
        return message;
    }

    private static String randomString() {
        int len = 12;
        StringBuilder sb = new StringBuilder(len);
        for (int i = 0; i<len; i++)
            sb.append(chars.charAt( random.nextInt(chars.length())));
        return sb.toString();
    }
}
