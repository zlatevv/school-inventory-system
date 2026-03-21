package bg.schoolinventory.authservice.service;

import bg.schoolinventory.authservice.dto.AuthResponseDTO;
import bg.schoolinventory.authservice.dto.LoginRequestDTO;
import bg.schoolinventory.authservice.dto.RegisterRequestDTO;
import bg.schoolinventory.authservice.model.Role;
import bg.schoolinventory.authservice.model.User;
import bg.schoolinventory.authservice.repository.UserRepository;
import bg.schoolinventory.authservice.security.JwtUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtils jwtUtils) {
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
}
