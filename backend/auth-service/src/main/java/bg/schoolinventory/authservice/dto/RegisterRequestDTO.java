package bg.schoolinventory.authservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class RegisterRequestDTO {

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 30, message = "Username should be between 3 and 30 characters!")
    private String username;

    @NotBlank(message = "Email is required")
    @Pattern(
            regexp = "^[a-zA-Z0-9]+([.\\-_][a-zA-Z0-9]+)*@[a-zA-Z0-9\\-]+(\\.[a-zA-Z]+)+$",
            message = "Invalid email!")
    private String email;

    @NotBlank(message = "Password is required")
    @Pattern(
            regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=\\S+$).{8,}$",
            message = "Password must contain at least one uppercase letter, one lowercase letter, and one number")
    private String password;

    public RegisterRequestDTO() {}

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}