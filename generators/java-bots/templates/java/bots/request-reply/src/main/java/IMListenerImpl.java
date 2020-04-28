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

    public void onIMMessage(InboundMessage msg) {
        OutboundMessage msgOut = new OutboundMessage("Hello " + msg.getUser().getFirstName() + "!");
        this.botClient.getMessagesClient().sendMessage(msg.getStream().getStreamId(), msgOut);
    }

    public void onIMCreated(Stream stream) {}
}
