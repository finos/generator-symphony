package com.symphony.platformsolutions.pizza.bot;

import com.symphony.platformsolutions.pizza.web.WebController;
import model.OutboundMessage;
import java.security.SecureRandom;
import java.util.stream.Collectors;

class PizzaController {
    private static SecureRandom random = new SecureRandom();
    private static final String chars = "0123456789abcdefghijklmnopqrstuvwxyz";
    private static final String menuML = "<div class=\"entity\" data-entity-id=\"pizza-menu\"><b><i>Please install A Pizza App to render this entity.</i></b></div>";
    private static final String menuData = "{\"pizza-menu\": { \"type\": \"com.symphony.ps.pizzaMenu\", \"version\": \"1.0\", \"options\": [\"$menu\"], \"quoteId\": \"$quoteId\" }}";
    private static OutboundMessage menuMessage;

    static OutboundMessage getMenuMessage() {
        if (menuMessage == null) {
            menuMessage = new OutboundMessage();
            menuMessage.setMessage(menuML);
        }
        menuMessage.setData(menuData
            .replace("$quoteId", randomString())
            .replace("$menu", String.join("\",\"", WebController.getMenuOptions()))
        );
        return menuMessage;
    }

    private static String randomString() {
        int len = 12;
        StringBuilder sb = new StringBuilder(len);
        for (int i = 0; i<len; i++)
            sb.append(chars.charAt( random.nextInt(chars.length())));
        return sb.toString();
    }
}
