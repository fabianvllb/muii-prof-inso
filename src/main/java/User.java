import java.io.Serializable;
import java.util.List;
import javax.persistence.*;

@Entity
@Table(name = "USERS")
public class User implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @Column(name = "email")
    private String email;

    @ElementCollection
    @CollectionTable(name = "URLS", joinColumns = @JoinColumn(name = "email"))
    @Column(name = "url")
    private List<String> urls;

    public User() {
    }

    public User(String email, List<String> urls) {
        this.email = email;
        this.urls = urls;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public List<String> getUrls() {
        return urls;
    }

    public void setUrls(List<String> urls) {
        this.urls = urls;
    }
}