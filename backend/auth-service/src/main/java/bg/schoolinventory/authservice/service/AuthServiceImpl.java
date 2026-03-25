package bg.schoolinventory.authservice.service;

import bg.schoolinventory.authservice.dto.*;
import bg.schoolinventory.authservice.model.Role;
import bg.schoolinventory.authservice.model.User;
import bg.schoolinventory.authservice.repository.UserRepository;
import bg.schoolinventory.authservice.security.JwtUtils;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.UUID;
import java.util.Map;

@Service
public class AuthServiceImpl implements AuthService {
    private final RabbitTemplate rabbitTemplate;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthServiceImpl(RabbitTemplate rabbitTemplate, UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtils jwtUtils) {
        this.rabbitTemplate = rabbitTemplate;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    @Override
    public String register(RegisterRequestDTO dto) {
        if (userRepository.existsByUsername(dto.getUsername())){
            throw new RuntimeException("Error - User already exists!");
        }
        if (userRepository.existsByEmail(dto.getEmail())){
            throw new RuntimeException("Error - E-mail already in use!");
        }

        User user = new User();

        user.setEmail(dto.getEmail());
        user.setUsername(dto.getUsername());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));

        if (userRepository.count() == 0) {
            user.setRole(Role.ADMIN);
        } else {
            user.setRole(Role.USER);
        }
        // The first user is going to be the admin for now

        user.setRegisteredOn(LocalDate.now());

        userRepository.save(user);
        sendNotification(
                dto.getUsername(),
                "Dear " + dto.getUsername() + ",\n" +
                        "We’re happy to let you know that your registration was completed successfully!\n" +
                        "Your account is now active, and you can start exploring all the features and services available to you. If you need any assistance or have questions, feel free to reach out to our support team at any time.\n" +
                        "Thank you for joining us—we’re glad to have you on board!\n\n" +
                        "Best regard \n" +
                        "Pennywise Team",
                dto.getEmail()
        );
        return "Successful Registration!";
    }

    @Override
    public AuthResponseDTO login(LoginRequestDTO dto) {
        User user = userRepository.findByUsername(dto.getUsername())
                .orElseThrow(() -> new RuntimeException("Error - Invalid username!"));

        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())){
            throw new RuntimeException("Error - Invalid password!");
        }
        String token = jwtUtils.generateToken(user.getUsername(), user.getRole().name());

        return new AuthResponseDTO(token, user.getUsername(), user.getRole().name(), user.getId());
    }

    @Override
    public UserDTO getUserByUsername(String username) {
        // Вземаме потребителя от базата
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Връщаме само имейла му
        return new UserDTO(user.getEmail());
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public void deleteUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Error - User not found!"));

        userRepository.delete(user);
    }

    @Override
    public void updateUser(String username, UpdateUserDTO dto) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Error - User not found!"));

        user.setEmail(dto.getEmail());
        user.setRole(Role.valueOf(dto.getRole().toUpperCase()));

        userRepository.save(user);
    }

    @Override
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public void resetPassword(String email) {
        // 1. Find the user
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("Email not found in our system.");
        }

        // 2. Generate a temporary password (8 characters)
        String tempPassword = UUID.randomUUID().toString().substring(0, 8);

        // 3. Hash the temporary password and save to DB
        user.setPassword(passwordEncoder.encode(tempPassword));
        userRepository.save(user);

        // 4. Send to Node.js via RabbitMQ
        // (Your Node.js script is listening to "email_queue" and expects targetEmail, title, message)
        Map<String, String> emailData = new HashMap<>();
        emailData.put("targetEmail", user.getEmail());
        emailData.put("title", "Password Reset - Pennywise Team");
        emailData.put("message", "Your password has been reset.\n\nYour new temporary password is: " + tempPassword + "\n\nPlease log in and change it immediately.");

        try {
            rabbitTemplate.convertAndSend("email_queue", emailData);
            System.out.println("Password reset email sent to queue for: " + email);
        } catch (Exception e) {
            System.err.println("Error sending to RabbitMQ: " + e.getMessage());
            throw new RuntimeException("Could not send email at this time.");
        }
    }

    private void sendNotification(String username, String message, String email) {
        try {
            NotificationEvent event = new NotificationEvent(username, "Registration Successful!", message, email);
            rabbitTemplate.convertAndSend("notification_queue", event);
            System.out.println("Нотификация пратена за потребител: " + username);
        } catch (Exception e) {
            System.err.println("Грешка при изпращане към RabbitMQ: " + e.getMessage());
        }
    }
}
