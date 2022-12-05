import java.util.List;
import java.util.Map;

public class SendEmail {
    public void sendEmail(UserData users, Map<String, String> differences) {
        System.out.println("sent the email to " + users.getEmail());
        if (users.hasData()) {
            writeEmail(users.getUrls(), differences);
        }
    }

    public String writeEmail(List<String> pages, Map<String, String> differences) {
        String result = "Hello :) here are the updates on your followed pages: ";
        for (String url: pages) {
            result += "\n" +  differences.get(url);
        }
        return result;
    }
}
