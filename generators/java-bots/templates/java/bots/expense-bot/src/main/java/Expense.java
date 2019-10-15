public class Expense {
    private String name;
    private String date;
    private String price;

    public Expense(String name, String date, String price) {
        this.name = name;
        this.date = date;
        this.price = price;
    }

    public String getName() {
        return name;
    }

    public String getDate() {
        return date;
    }

    public String getPrice() {
        return price;
    }
}
