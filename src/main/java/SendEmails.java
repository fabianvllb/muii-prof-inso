import java.sql.*;
import java.util.*;
import javax.mail.*;
import javax.mail.internet.*;

public class SendEmails {
    public static void main(String[] args) {
        List<String> emailAddresses = new ArrayList<>();
        Connection conn = null;
        try {
            Class.forName("org.mariadb.jdbc.Driver");
            conn = DriverManager.getConnection("jdbc:mariadb://hostname:port/dbname", "username", "password");
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT email FROM users");
            while (rs.next()) {
                emailAddresses.add(rs.getString("email"));
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (conn != null) {
                try {
                    conn.close();
                } catch (SQLException e) {
                    // Do nothing
                }
            }
        }

        Properties props = new Properties();
        props.put("mail.smtp.host", "smtp.gmail.com");
        props.put("mail.smtp.port", "587");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");

        Session session = Session.getInstance(props, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication("sender@gmail.com", "sender_password");
            }
        });

        for (String emailAddress : emailAddresses) {
            try {
                Message message = new MimeMessage(session);
                message.setFrom(new InternetAddress("sender@gmail.com"));
                message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(emailAddress));
                message.setSubject("Subject");
                message.setText("Hello,\n\nThis is a test email.");

                Transport.send(message);
                System.out.println("Sent email to " + emailAddress);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}