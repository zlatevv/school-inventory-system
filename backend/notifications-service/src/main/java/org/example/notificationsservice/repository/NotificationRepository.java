package org.example.notificationsservice.repository;

import org.example.notificationsservice.dto.NotificationDTO;
import org.example.notificationsservice.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<NotificationDTO> findByUserIdOrderByCreatedAtDesc(Long userId);
}
