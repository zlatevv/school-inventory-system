package bg.schoolinventory.authservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    @Size(min = 3, max = 30, message = "Username should be between 3 and 30 characters!")
    private String username;

    @Column(unique = true, nullable = false)
    @Pattern(
            regexp = "^[a-zA-Z0-9]+([.\\-_][a-zA-Z0-9]+)*@[a-zA-Z]+(\\.[a-zA-Z]+)+$",
            message = "Invalid email!"
    )
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "registered_on")
    private LocalDate registeredOn;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    public User() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public LocalDate getRegisteredOn() {
        return registeredOn;
    }

    public void setRegisteredOn(LocalDate registeredOn) {
        this.registeredOn = registeredOn;
    }
}
