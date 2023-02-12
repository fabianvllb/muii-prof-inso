import org.springframework.web.bind.annotation.*;

import java.util.Collections;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/{id}")
    public User updateUserUrl(@PathVariable Long id, @RequestParam String url) throws Exception {
        User user = userRepository.findById(id).orElseThrow(() -> new Exception());
        user.setUrls(Collections.singletonList(url));
        return userRepository.save(user);
    }
}