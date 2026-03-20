package org.example.notificationsservice.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Table(name = "notifications")
@Entity
@Data
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 500)
    private String message;

    private boolean isRead = false;

    private LocalDateTime createdAt = LocalDateTime.now();
}
