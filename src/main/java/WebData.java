import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "WebData")
public class WebData {
    private String newData;
    private String oldData;

    public WebData(String newData, String oldData) {
        this.newData = newData;
        this.oldData = oldData;
    }

    public String getNewData() {
        return newData;
    }

    public String getOldData() {
        return oldData;
    }

    public boolean hasOldData() {
        return !(oldData == null || oldData.equals(""));
    }
    public boolean hasNewData() {
        return !(newData == null || newData.equals(""));
    }

    public void setNewData(String newData) {
        this.newData = newData;
    }

    public void setOldData(String oldData) {
        this.oldData = oldData;
    }
}
