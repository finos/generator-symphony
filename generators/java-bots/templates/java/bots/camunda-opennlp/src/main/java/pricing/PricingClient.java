package pricing;

import com.fasterxml.jackson.databind.ObjectMapper;
import pricing.model.*;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.IOException;
import java.util.List;

public class PricingClient {

   // https://api.iextrading.com/1.0/stock/aapl/batch?types=quote,news


    public static Quote getQuote(String symbol){
        Client client = ClientBuilder.newClient();
        Response response
                = client.target("https://api.iextrading.com/1.0/stock/")
                .path(symbol+"/batch")
                .queryParam("types", "quote")
                .request(MediaType.APPLICATION_JSON)
                .get();
        if (response.getStatusInfo().getFamily() != Response.Status.Family.SUCCESSFUL) {

            return null;
        }
        else {
            IEXResponse iexResponse = response.readEntity(IEXResponse.class);
            if(iexResponse!=null)
                return iexResponse.getQuote();
            else
                return null;
        }
    }

    public static List<News> getNews(String symbol){
        Client client = ClientBuilder.newClient();
        Response response
                = client.target("https://api.iextrading.com/1.0/stock/")
                .path(symbol+"/batch")
                .queryParam("types", "news")
                .request(MediaType.APPLICATION_JSON)
                .get();
        if (response.getStatusInfo().getFamily() != Response.Status.Family.SUCCESSFUL) {

            return null;
        }
        else {
            IEXResponse iexResponse = response.readEntity(IEXResponse.class);
            if(iexResponse!=null)
                return iexResponse.getNews();
            else
                return null;
        }
    }

    public static List<Security> companyLookup(String term){
        Client client = ClientBuilder.newClient();
        Response response
                = client.target("https://sandbox.tradier.com/v1/")
                .path("markets/search")
                .queryParam("q", term)
                .request(MediaType.APPLICATION_JSON)
                .header("Authorization","Bearer 1LP06T7UdoLDu8lFYWLjr2UG9H7t")
                .get();
        if (response.getStatusInfo().getFamily() != Response.Status.Family.SUCCESSFUL) {

            return null;
        }
        else {
            SecuritySearchResponse symbolList = response.readEntity(SecuritySearchResponse.class);
            if(symbolList != null && symbolList.getSecurities() !=null) {
                return symbolList.getSecurities().getSecurity();
            }
            else {
                return null;
            }
        }
    }

    public static Security symbolLookup(String term){
        Client client = ClientBuilder.newClient();
        Response response
                = client.target("https://sandbox.tradier.com/v1/")
                .path("markets/lookup")
                .queryParam("q", term)
                .request(MediaType.APPLICATION_JSON)
                .header("Authorization","Bearer 1LP06T7UdoLDu8lFYWLjr2UG9H7t")
                .get();
        if (response.getStatusInfo().getFamily() != Response.Status.Family.SUCCESSFUL) {

            return null;
        }
        else {
            String responseString = response.readEntity(String.class);
            try {
                ObjectMapper mapper = new ObjectMapper();

                SecuritySearchResponse symbolList  = mapper.readValue(responseString,SecuritySearchResponse.class);
                if(symbolList != null && symbolList.getSecurities() !=null) {
                    return symbolList.getSecurities().getSecurity().get(0);
                }
                else {
                    return null;
                }
            }
            catch (Exception e){
                try{
                    ObjectMapper mapper = new ObjectMapper();

                    SecuritySearchResponseAlt symbolList  = mapper.readValue(responseString,SecuritySearchResponseAlt.class);
                    if(symbolList != null && symbolList.getSecurities() !=null) {
                        return symbolList.getSecurities().getSecurity();
                    }
                    else {
                        return null;
                    }


                } catch (Exception ex){
                    return  null;
                }
            }

        }
    }

}
