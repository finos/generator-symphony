package pricing.model;

import java.util.List;

public class IEXResponse {

    private Quote quote;
    private List<News> news;

    public Quote getQuote() {
        return quote;
    }

    public void setQuote(Quote quote) {
        this.quote = quote;
    }

    public List<News> getNews() {
        return news;
    }

    public void setNews(List<News> news) {
        this.news = news;
    }


}
