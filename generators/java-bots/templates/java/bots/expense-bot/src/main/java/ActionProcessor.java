import clients.SymBotClient;
import clients.symphony.api.StreamsClient;
import clients.symphony.api.UsersClient;
import model.OutboundMessage;
import model.User;
import model.UserInfo;
import model.events.SymphonyElementsAction;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class ActionProcessor {
    private SymBotClient botClient;

    public ActionProcessor(SymBotClient botClient) {
        this.botClient = botClient;
    }

    public void process(SymphonyElementsAction action, User user) {
        Map<String, Object> formValues =  action.getFormValues();

        switch (action.getFormId()) {
            case "add-expense-form": {
                if (formValues.get("action").equals("add-expense-button")) {
                    this.manageAddExpenseForm(action);
                }
                break;
            }
            case "expense-approval-form": {
                if (formValues.get("action").equals("submit-expense")) {
                    this.manageExpenseApprovalForm(action, user);
                }
                break;
            }
        }
    }

    public void manageAddExpenseForm(SymphonyElementsAction action) {
        Map<String, Object> formValues =  action.getFormValues();
        String vendor = (String)formValues.get("vendor-textfield");
        String date = (String)formValues.get("date-textfield");
        String price = (String)formValues.get("price-textfield");

        Expense newExpense = new Expense(vendor, date, price);
        ExpenseManager.getInstance().addExpense(newExpense);

        OutboundMessage messageOut = MessageSender.getInstance().buildCreateFormMessage();

        MessageSender.getInstance().sendMessage(action.getStreamId(), messageOut);
    }

    public void manageExpenseApprovalForm(SymphonyElementsAction action, User user) {
        Map<String, Object> formValues =  action.getFormValues();
        ArrayList<Long> referals = (ArrayList<Long>)formValues.get("person-selector");

        if (referals.size() > 0) {
            StreamsClient streamsClient = this.botClient.getStreamsClient();
            try {
                String roomId = streamsClient.getUserListIM((List<Long>)referals);

                OutboundMessage messageOut = MessageSender.getInstance().buildApprovalMessage(referals, user.getUserId().toString());

                MessageSender.getInstance().sendMessage(roomId, messageOut);
            } catch (Exception e) {
                e.printStackTrace();
            }

            UsersClient usersClient = this.botClient.getUsersClient();

            try {
                List<UserInfo> usersInfo = usersClient.getUsersFromIdList((List<Long>)referals, false);
                String referalUsers = usersInfo.stream().map(UserInfo::getDisplayName).collect(Collectors.joining(","));

                OutboundMessage messageOut = MessageSender.getInstance().buildConfirmMessage(referalUsers);

                MessageSender.getInstance().sendMessage(action.getStreamId(), messageOut);

                ExpenseManager.getInstance().reset();
            } catch (Exception e) {
                e.printStackTrace();
            }
        } else {
            OutboundMessage messageOut = MessageSender.getInstance().buildCreateFormMessage(true);

            MessageSender.getInstance().sendMessage(action.getStreamId(), messageOut);
        }
    }
}
