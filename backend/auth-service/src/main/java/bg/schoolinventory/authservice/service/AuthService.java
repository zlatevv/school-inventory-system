package bg.schoolinventory.authservice.service;

import bg.schoolinventory.authservice.dto.AuthResponseDTO;
import bg.schoolinventory.authservice.dto.LoginRequestDTO;
import bg.schoolinventory.authservice.dto.RegisterRequestDTO;
import bg.schoolinventory.authservice.dto.UserDTO;

public interface AuthService {
    String register(RegisterRequestDTO dto);
    AuthResponseDTO login(LoginRequestDTO dto);
    UserDTO getUserByUsername(String username);
}
