import clients.SymBotClient;
import model.OutboundMessage;
import model.UserInfo;

import java.text.DecimalFormat;

public class MessageSender {
    private static MessageSender instance;
    private SymBotClient botClient;

    private MessageSender(SymBotClient botClient) {
        this.botClient = botClient;
    }

    public static MessageSender getInstance() {
        if (instance != null) {
            return instance;
        } else {
            throw new RuntimeException("MessageSender needs to be initialized at startup");
        }
    }

    public static MessageSender createInstance(SymBotClient botClient) {
        if (instance == null) {
            instance = new MessageSender(botClient);
            return instance;
        } else {
            return instance;
        }
    }

    public void sendMessage(String streamId, OutboundMessage messageOut) {
        try {
            this.botClient.getMessagesClient().sendMessage(streamId, messageOut);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public OutboundMessage buildHelpMessage() {
        UserInfo botUserInfo = this.botClient.getBotUserInfo();
        String message =
                "<h3>Use ExpenseBot to create and submit an expense form using Symphony Elements</h3>" +
                "<p>Type @" + botUserInfo.getUsername() + " <b>create expense</b> to create an expense approval form</p>" +
                "<p>In order to assign your expense approval form to your manager, you must first add an expense</p>";

        OutboundMessage messageOut = new OutboundMessage();
        messageOut.setMessage(message);

        return messageOut;
    }

    public OutboundMessage buildCreateFormMessage() {
        return this.buildCreateFormMessage(false);
    }

    public OutboundMessage buildCreateFormMessage(Boolean errorOnReferals) {
        ExpenseManager expenseManager = ExpenseManager.getInstance();

        String message =
                "<h1>Expense form for " + expenseManager.getPersonName() + "</h1>" +
                "<hr />" +
                "<h3>Expense list :</h3>" +
                "<table>" +
                    "<thead>" +
                        "<tr>" +
                            "<td>Expense Name:</td>" +
                            "<td>Expense Date:</td>" +
                            "<td>Expense Amount:</td>" +
                        "</tr>" +
                    "</thead>" +
                    "<tbody>";

        DecimalFormat formatter = new DecimalFormat("#0.00");

        for (Expense expense : expenseManager.getExpenses()) {
            Float price = Float.parseFloat(expense.getPrice());
            message +=
                    "<tr>" +
                        "<td>" + expense.getName() + "</td>" +
                        "<td>" + expense.getDate() + "</td>" +
                        "<td>$" + formatter.format(price) + "</td>" +
                    "</tr>";
        }

        message +=
                "</tbody>" +
                "<tfoot>" +
                    "<tr>" +
                        "<td></td>" +
                        "<td></td>" +
                        "<td>Total: $" + formatter.format(expenseManager.getReportTotal()) + "</td>" +
                    "</tr>" +
                "</tfoot>" +
            "</table>";

        message +=
                "<br />" +
                "<div style=\"display: flex;\">" +
                    "<div style=\"width: 70%;\">" +
                        "<h3>New expense :</h3>" +
                        "<form id=\"add-expense-form\">" +
                            "<text-field name=\"vendor-textfield\" placeholder=\"Enter a vendor: \" required=\"true\" />" +
                            "<br />" +
                            "<text-field name=\"date-textfield\" placeholder=\"Enter a Date: \" required=\"true\" />" +
                            "<br/>" +
                            "<text-field name=\"price-textfield\" placeholder=\"Enter a Price: \" required=\"true\" />" +
                            "<br/>" +
                            "<button type=\"action\" name=\"add-expense-button\">Add Expense</button>" +
                        "</form>" +
                    "</div>";

        if (expenseManager.getExpenses().size() > 0) {
            message +=
                    "<div style=\"width: 30%;\">" +
                        "<h3>Expense Form Submission :</h3>";

            if (errorOnReferals) {
                message +=
                    "<span class=\"tempo-text-color--red\">" +
                        "You need to choose a least on referal before to submit your expense form." +
                    "</span>";
            }

            message +=
                "<form id=\"expense-approval-form\">" +
                    "<p>Choose at least one referal to submit your expense form</p>" +
                    "<br />" +
                    "<person-selector name=\"person-selector\" placeholder=\"Select Your Boss\" required=\"true\" />" +
                    "<button type=\"action\" name=\"submit-expense\">Submit</button>" +
                "</form>" +
            "</div>";
        }

        message += "</div>";

        OutboundMessage messageOut = new OutboundMessage();
        messageOut.setMessage(message);

        return messageOut;
    }

    public OutboundMessage buildConfirmMessage(String referalUsers) {
        String message =
                "<h3>Your expense has been submitted to " + referalUsers + ".</h3>" +
                "<p>Thanks for using ExpenseBot !</p>";

        OutboundMessage messageOut = new OutboundMessage();
        messageOut.setMessage(message);

        return messageOut;
    }
}