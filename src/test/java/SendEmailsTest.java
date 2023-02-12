import static org.mockito.Mockito.*;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@RunWith(MockitoJUnitRunner.class)
public class SendEmailsTest {

    @InjectMocks
    private SendEmails sendEmails;

    @Mock
    private UserRepository userRepository;

    @Test
    public void testSendEmails() {
        List<User> users = Arrays.asList(
                new User("user1@example.com", new ArrayList(Collections.singleton("url1"))),
                new User("user2@example.com", new ArrayList(Collections.singleton("url2")))
        );
        when(userRepository.findAll()).thenReturn(users);

        //sendEmails.sendEmails();

        verify(userRepository, times(1)).findAll();
        // Add more verification statements to verify that the emails are sent correctly
        // ...
    }
}