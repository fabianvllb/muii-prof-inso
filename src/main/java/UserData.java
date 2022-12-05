import java.util.ArrayList;
import java.util.List;

public class UserData {
    private String email;
    private List<String> urls;

    public UserData(String email) {
        this.email = email;
        this.urls = new ArrayList<>();
    }

    public String getEmail() {
        return email;
    }

    public List<String> getUrls() {
        return urls;
    }

    public boolean hasData() {
        return !(urls == null || urls.isEmpty());
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void addUrls(String urls) {
        this.urls.add(urls);
    }
}
