package org.example.notificationsservice.dto;

import java.time.LocalDateTime;

public interface NotificationDTO {
    Long getId();
    String getTitle();
    String getMessage();
    boolean isRead();
    LocalDateTime getCreatedAt();
}
