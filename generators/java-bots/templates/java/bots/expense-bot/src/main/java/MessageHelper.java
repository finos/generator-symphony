public class MessageHelper {
    public static String clean(String message) {
        String cleanMessage = message;

        // removing mentions
        cleanMessage = cleanMessage.replaceAll("\\B@[\\w-]+", "");

        // removing hashtags
        cleanMessage = cleanMessage.replaceAll("\\B#[\\w-]+", "");

        // removing cashtags
        cleanMessage = cleanMessage.replaceAll("\\B\\$[\\w-]+", "");

        // trim whitespaces
        cleanMessage = cleanMessage.trim();

        return cleanMessage;
    }
}