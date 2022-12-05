import org.jsoup.Jsoup;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.management.Query;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class DataRecoveryAndComparison {

    private static Logger LOGGER = LoggerFactory.getLogger(DataRecoveryAndComparison.class);

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

    public Map<String, String> diferenceExtraction(Map<String, WebData> data) {//TODO First approach needs work
        Map<String, String> differences = new HashMap<>();
        for (String name : data.keySet()) {
            if (!data.get(name).hasOldData() || !data.get(name).hasNewData()) {
                differences.put(name, "Page could not be accesed");
            } else if (!data.get(name).getOldData().equals(data.get(name).getNewData())) {
                differences.put(name, "Differences detected in page " + name + " Changes :"); //TODO change detection to be determined
            }
        }
        return differences;
    }

    public void webDownloadTestingSame(Map<String, WebData> fullData) {
        fullData.put("testUrl", new WebData("HTMLCODE", "HTMLCODE"));
    }

    public void webDownloadTestingDifferent(Map<String, WebData> fullData) {
        fullData.put("testUrl", new WebData("HTMLCODE", "ERROR"));
    }

    public void retrievePageData(Query query, Map<String, WebData> dataToFill){
        dataToFill.put("URL", new WebData("", ""));//TODO retrieve urls in database when its created
    }

    public String[] retrieveUserData(){
        return new String[]{"TestUser"};//TODO retrieve urls in database when its created
    }

}
