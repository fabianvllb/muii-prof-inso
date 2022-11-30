import javax.management.Query;
import java.util.HashMap;
import java.util.Map;

public class WebCompare {

    public Map<String, String> compareHtml(){
        DataRecovery exeClass = new DataRecovery();
        Query query = new Query();
        Map<String, WebData> newPages = exeClass.dataRetrival(query);
        return diferenceExtraction(newPages);
    }
    public Map<String, String> diferenceExtraction(Map<String, WebData> data){//TODO First approach needs work
        Map<String, String> differences = new HashMap<>();
        for (String name:data.keySet()) {
            if (!data.get(name).hasData()) {
                differences.put(name, "Page could not be accesed");
            } else if (!data.get(name).getOldData().equals(data.get(name).getNewData())) {
                differences.put(name, "Differences detected in page " + name + " Changes :" ); //TODO change detection to be determined
            }
        }
        return differences;
    }

}
