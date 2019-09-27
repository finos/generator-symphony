import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.select.Elements;

public class MessageHelper {
    public static String clean(String message) {
        // trim entities
        Document doc = Jsoup.parse(message);
        Elements entities = doc.getElementsByClass("entity");
        entities.html("");

        String cleanMessage = doc.body().text();

        // trim whitespaces
        cleanMessage = cleanMessage.trim();

        return cleanMessage;
    }
}