package pricing;

import pricing.model.News;
import pricing.model.Quote;
import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.core.GenericType;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.List;

public class IEXClient {
    private static final String IEX_URI = "https://cloud.iexapis.com/v1/";
    private static final String TOKEN = "sk_3a4a3a012eca49c393551bbff75c5e5c";
    private static Client client = ClientBuilder.newClient();

    public static Quote getQuote(String symbol) {
        Response response = client.target(IEX_URI)
            .path(String.format("stock/%s/quote", symbol))
            .queryParam("token", TOKEN)
            .request(MediaType.APPLICATION_JSON)
            .get();
        if (response.getStatusInfo().getFamily() != Response.Status.Family.SUCCESSFUL) {
            return null;
        }
        return response.readEntity(Quote.class);
    }

    public static List<News> getNews(String symbol) {
        Response response = client.target(IEX_URI)
            .path(String.format("stock/%s/news/last", symbol))
            .queryParam("token", TOKEN)
            .request(MediaType.APPLICATION_JSON)
            .get();
        if (response.getStatusInfo().getFamily() != Response.Status.Family.SUCCESSFUL) {
            return null;
        }
        return response.readEntity(new GenericType<List<News>>() {});
    }
}
