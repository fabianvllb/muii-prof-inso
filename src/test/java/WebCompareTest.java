import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

public class WebCompareTest {

    WebCompare testClass = new WebCompare();

    @Test
    public void htmlCompareTestOk(){
        HashMap<String, WebData> testData = new HashMap<>();
        testData.put("url", new WebData("This", "This"));
        Map<String, String> results = testClass.diferenceExtraction(testData);
        Assertions.assertEquals(null, results.get("url"));
    }
    @Test
    public void htmlCompareTestKo(){
        HashMap<String, WebData> testData = new HashMap<>();
        testData.put("url", new WebData("That", "This"));
        Map<String, String> results = testClass.diferenceExtraction(testData);
        Assertions.assertEquals("Differences detected in page " +
                "url Changes :", results.get("url"));
    }
    @Test
    public void htmlCompareTestIncompleteData(){
        HashMap<String, WebData> testData = new HashMap<>();
        testData.put("url", new WebData(null, null));
        Map<String, String> results = testClass.diferenceExtraction(testData);
        Assertions.assertEquals("Page could not be accesed", results.get("url"));
    }
}
