import java.sql.*;
import javax.ws.rs.*;
import javax.ws.rs.core.*;

@Path("/{id}")
public class BasicAPI {
    @GET
    @Produces(MediaType.TEXT_PLAIN)
    public Response getString(@PathParam("id") int id) {
        String string = null;
        Connection conn = null;
        try {
            Class.forName("org.mariadb.jdbc.Driver");
            conn = DriverManager.getConnection("jdbc:mariadb://hostname:port/dbname", "username", "password");
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT string FROM strings WHERE id = " + id);
            if (rs.next()) {
                string = rs.getString("string");
            }
        } catch (Exception e) {
            return Response.serverError().entity(e.getMessage()).build();
        } finally {
            if (conn != null) {
                try {
                    conn.close();
                } catch (SQLException e) {
                    // Do nothing
                }
            }
        }
        return Response.ok(string).build();
    }
}