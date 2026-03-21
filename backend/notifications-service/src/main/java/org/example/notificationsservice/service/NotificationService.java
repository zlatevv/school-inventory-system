package org.example.notificationsservice.service;

import org.example.notificationsservice.dto.NotificationEvent;
import org.example.notificationsservice.model.Notification;

import java.util.List;

public interface NotificationService {
    void createNotification(NotificationEvent event);
    List<Notification> getUserNotifications(Long userId);
    void markNotificationAsRead(Long notificationId);
}
