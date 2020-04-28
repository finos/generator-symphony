import clients.SymBotClient;
import org.apache.log4j.BasicConfigurator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ExpenseBot {
    private static final Logger log = LoggerFactory.getLogger(ExpenseBot.class);

    public static void main(String[] args) {
        new ExpenseBot();
    }

    public ExpenseBot() {
        BasicConfigurator.configure();

        try {
            SymBotClient botClient = SymBotClient.initBot("config.json");

            MessageSender.createInstance(botClient);

            MessageProcessor messageProcessor = new MessageProcessor(botClient);
            ActionProcessor actionProcessor = new ActionProcessor(botClient);

            botClient.getDatafeedEventsService().addListeners(
                new IMListenerImpl(messageProcessor),
                new RoomListenerImpl(messageProcessor),
                new ElementsListenerImpl(actionProcessor)
            );
        } catch (Exception e) {
            log.error("Error", e);
        }
    }
}
