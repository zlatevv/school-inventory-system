package org.example.notificationsservice.service;

import org.example.notificationsservice.dto.NotificationDTO;
import org.example.notificationsservice.dto.NotificationEvent;

import java.util.List;

public interface NotificationService {
    void createNotification(NotificationEvent event);
    List<NotificationDTO> getUserNotifications(Long userId);
    void markNotificationAsRead(Long notificationId);
}
