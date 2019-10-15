import listeners.ElementsListener;
import model.User;
import model.events.SymphonyElementsAction;

public class ElementsListenerImpl implements ElementsListener {
    private ActionProcessor actionProcessor;

    public ElementsListenerImpl(ActionProcessor actionProcessor) {
        this.actionProcessor = actionProcessor;
    }

    public void onElementsAction(User user, SymphonyElementsAction action) {
        this.actionProcessor.process(action);
    }
}
