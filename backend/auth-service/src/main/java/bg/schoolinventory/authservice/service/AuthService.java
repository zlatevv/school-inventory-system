package bg.schoolinventory.authservice.service;

import bg.schoolinventory.authservice.dto.*;
import bg.schoolinventory.authservice.model.User;

import java.util.List;

public interface AuthService {
    String register(RegisterRequestDTO dto);
    AuthResponseDTO login(LoginRequestDTO dto);
    UserDTO getUserByUsername(String username);
    List<User> getAllUsers();
    void deleteUser(String username);
    void updateUser(String username, UpdateUserDTO dto);
}
