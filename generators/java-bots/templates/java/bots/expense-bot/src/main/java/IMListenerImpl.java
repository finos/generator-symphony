import listeners.IMListener;
import model.InboundMessage;
import model.Stream;

public class IMListenerImpl implements IMListener {
    private MessageProcessor messageProcessor;

    public IMListenerImpl(MessageProcessor messageProcessor) {
        this.messageProcessor = messageProcessor;
    }

    public void onIMMessage(InboundMessage inboundMessage) {
        this.messageProcessor.process(inboundMessage);
    }

    public void onIMCreated(Stream stream) {}
}
