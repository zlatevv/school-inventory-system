package org.example.notificationsservice.service;

import org.example.notificationsservice.dto.NotificationEvent;
import org.example.notificationsservice.model.Notification;

import java.util.List;

public interface NotificationService {
    void createNotification(NotificationEvent event);
    List<Notification> getUserNotifications(String username);
    void markNotificationAsRead(Long notificationId);
}
