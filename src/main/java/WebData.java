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

    public boolean hasData() {
        return !(newData == null || oldData == null || newData.equals("") || oldData.equals(""));
    }

    public void setNewData(String newData) {
        this.newData = newData;
    }

    public void setOldData(String oldData) {
        this.oldData = oldData;
    }
}
