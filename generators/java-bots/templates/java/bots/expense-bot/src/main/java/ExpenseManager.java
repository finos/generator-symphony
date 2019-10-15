import java.util.ArrayList;

public class ExpenseManager {
    private static ExpenseManager instance;

    private String personName;
    private ArrayList<Expense> expenses;
    private Float reportTotal;

    public ExpenseManager() {
        this.reset();
    }

    public static ExpenseManager getInstance() {
        if (instance == null) {
            instance = new ExpenseManager();
        }

        return instance;
    }

    public void reset() {
        this.personName = "";
        this.expenses = new ArrayList<Expense>();
        this.reportTotal = 0.0f;
    }

    public String getPersonName() {
        return personName;
    }

    public void setPersonName(String personName) {
        this.personName = personName;
    }

    public ArrayList<Expense> getExpenses() {
        return expenses;
    }

    public Float getReportTotal() {
        return reportTotal;
    }

    public void addExpense(Expense expense) {
        this.expenses.add(expense);

        this.reportTotal = this.reportTotal + Float.parseFloat(expense.getPrice());
    }
}
