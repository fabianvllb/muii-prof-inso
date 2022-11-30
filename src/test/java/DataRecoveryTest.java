import org.jsoup.Connection;
import org.jsoup.Jsoup;
import org.jsoup.helper.HttpConnection;
import org.jsoup.nodes.Document;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.io.IOException;
import java.util.HashMap;

public class DataRecoveryTest {

    DataRecovery dataRecovery = new DataRecovery();
    @Test
    public void checkDatabaseConnection(){ // TODO when database conection is done
    }
    @Test
    public void downloadWebDataTest() throws IOException {
        HashMap<String, WebData> testData = new HashMap<>();
        testData.put("http://testUrl", new WebData("", "OldData"));
        Connection testConnection = new HttpConnection();
        Mockito.when(Jsoup.connect("http://testUrl")).thenReturn(testConnection);
        Document testDoc = new Document("");
        Mockito.when(testConnection.get()).thenReturn(testDoc);
        Mockito.when(testDoc.html()).thenReturn("Recovery correct");
        dataRecovery.webCheckAndDownload(testData);
        Assertions.assertEquals("Recovery correct", testData.get("http://testUrl").getNewData());
    }
}
