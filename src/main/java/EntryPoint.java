import java.util.HashMap;
import java.util.Map;

public class EntryPoint {
    public static void main(String[] args){
        Map<String, WebData> testedValues = new HashMap<>();
        DataRecoveryAndComparison dataRecovery = new DataRecoveryAndComparison();
        dataRecovery.webDownloadTestingDifferent(testedValues);
        Map<String, String> result = dataRecovery.diferenceExtraction(testedValues);
        SendEmail sendEmail = new SendEmail();
        UserData testData = new UserData("user");
        testData.addUrls("testUrl");
        sendEmail.sendEmail(testData, result);
    }
}
