import org.jsoup.Jsoup;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.management.Query;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class DataRecovery {

    private static Logger LOGGER = LoggerFactory.getLogger(DataRecovery.class);

    public Map<String, WebData> dataRetrival(Query queryNeeded) {
        Map<String, WebData> pageDataList = new HashMap<>();
        retrievePageData(queryNeeded ,pageDataList);
        webCheckAndDownload(pageDataList);
        return pageDataList;
    }

    public void webCheckAndDownload(Map<String, WebData> fullData) {
        for (String url:fullData.keySet()) {
            try {
                fullData.get(url).setNewData(Jsoup.connect(url).get().html());
                //TODO insert new data into database
            } catch (IOException ex) {
                LOGGER.error("Web page "+ url +" returned error when accessed");//TODO What do we do with failed access?
            }
        }
    }

    public void retrievePageData(Query query, Map<String, WebData> dataToFill){
        dataToFill.put("URL", new WebData("", ""));//TODO retrieve urls in database when its created
    }

}
