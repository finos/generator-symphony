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
        OutboundMessage messageOut = new OutboundMessage();
        messageOut.setMessage("Hi "+inboundMessage.getUser().getFirstName()+"!");
        try {
            this.botClient.getMessagesClient().sendMessage(inboundMessage.getStream().getStreamId(), messageOut);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void onIMCreated(Stream stream) {

    }
}
