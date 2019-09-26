import clients.SymBotClient;
import model.InboundMessage;
import model.OutboundMessage;
import model.UserInfo;
import utils.SymMessageParser;

import java.util.List;

public class MessageProcessor {
    private SymBotClient botClient;

    public MessageProcessor(SymBotClient botClient) {
        this.botClient = botClient;
    }

    public void process(InboundMessage inboundMessage) {
        List<Long> mentions = SymMessageParser.getInstance().getMentions(inboundMessage);

        UserInfo botUserInfo = this.botClient.getBotUserInfo();

        if (mentions.contains(botUserInfo.getId())) {
            String cleanMessage = MessageHelper.clean(inboundMessage.getMessageText());
            String[] commands = cleanMessage.split(" ");

            Boolean sendHelpMessage = false;
            if (commands.length > 0) {
                switch (commands[0].toLowerCase()) {
                    case "help": {
                        sendHelpMessage = true;
                        break;
                    }
                    case "create": {
                        if (commands.length > 1 && commands[1].toLowerCase().equals("expense")) {
                            this.sendCreateForm(inboundMessage);
                        } else {
                            sendHelpMessage = true;
                        }
                        break;
                    }
                    default: {
                        sendHelpMessage = true;
                    }
                }
            }

            if (sendHelpMessage) {
                OutboundMessage messageOut = MessageSender.getInstance().buildHelpMessage();

                MessageSender.getInstance().sendMessage(inboundMessage.getStream().getStreamId(), messageOut);
            }
        }
    }

    public void sendCreateForm(InboundMessage inboundMessage) {
        ExpenseManager.getInstance().reset();

        ExpenseManager.getInstance().setPersonName(inboundMessage.getUser().getDisplayName());

        OutboundMessage messageOut = MessageSender.getInstance().buildCreateFormMessage();

        MessageSender.getInstance().sendMessage(inboundMessage.getStream().getStreamId(), messageOut);
    }
}