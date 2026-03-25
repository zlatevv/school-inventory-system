package bg.schoolinventory.requestservice.dto;

public class NotificationEvent {
    private String username;
    private String title;
    private String message;
    private String email;

    public NotificationEvent(String username, String title, String message, String email) {
        this.username = username;
        this.title = title;
        this.message = message;
        this.email = email;
    }

    public NotificationEvent() {
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
