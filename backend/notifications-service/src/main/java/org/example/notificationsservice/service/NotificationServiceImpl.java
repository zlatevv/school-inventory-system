package org.example.notificationsservice.service;

import jakarta.transaction.Transactional;
import org.example.notificationsservice.dto.NotificationEvent;
import org.example.notificationsservice.model.Notification;
import org.example.notificationsservice.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository notificationRepository;

    public NotificationServiceImpl(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Override
    public void createNotification(NotificationEvent event) {
        Notification notification = new Notification();

        notification.setUserId(event.getUserId());
        notification.setMessage(event.getMessage());
        notification.setTitle(event.getTitle());

        notificationRepository.save(notification);
    }

    @Override
    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    @Transactional
    public void markNotificationAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Error - no such notification"));

        notification.setRead(true);

        notificationRepository.save(notification);
    }
}
