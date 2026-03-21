package bg.schoolinventory.requestservice.service;

import bg.schoolinventory.requestservice.client.EquipmentClient;
import bg.schoolinventory.requestservice.dto.EquipmentDTO;
import bg.schoolinventory.requestservice.dto.NotificationEvent;
import bg.schoolinventory.requestservice.enums.RequestStatus;
import bg.schoolinventory.requestservice.model.Request;
import bg.schoolinventory.requestservice.repository.RequestRepository;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ReturnReminderJob {

    private final RequestRepository requestRepository;
    private final EquipmentClient equipmentClient;
    private final RabbitTemplate rabbitTemplate;

    public ReturnReminderJob(RequestRepository requestRepository,
                             EquipmentClient equipmentClient,
                             RabbitTemplate rabbitTemplate) {
        this.requestRepository = requestRepository;
        this.equipmentClient = equipmentClient;
        this.rabbitTemplate = rabbitTemplate;
    }

    @Scheduled(fixedRate = 20000)
    public void sendRemindersForTomorrow() {
        // 1. Изчисляваме кога започва и кога свършва утрешният ден
        LocalDateTime startOfTomorrow = LocalDateTime.now().plusDays(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfTomorrow = LocalDateTime.now().plusDays(1).withHour(23).withMinute(59).withSecond(59);

        // 2. Взимаме всички одобрени заявки, които изтичат утре
        List<Request> expiringRequests = requestRepository.findByStatusAndBorrowEndTimeBetween(
                RequestStatus.APPROVED, startOfTomorrow, endOfTomorrow);

        if (expiringRequests.isEmpty()) {
            System.out.println("Няма оборудване за връщане утре.");
            return;
        }

        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        // 3. За всяка заявка пращаме нотификация
        for (Request request : expiringRequests) {
            try {
                EquipmentDTO equipment = equipmentClient.getEquipmentById(request.getEquipmentID());
                String equipmentName = equipment != null ? equipment.getName() : "Оборудване";

                String returnTime = request.getBorrowEndTime().format(timeFormatter);

                String title = "Return Reminder";
                String message = String.format("Friendly reminder: The %s is due for return tomorrow at %s.",
                        equipmentName, returnTime);

                NotificationEvent event = new NotificationEvent(request.getUsernameRequesting(), title, message);
                rabbitTemplate.convertAndSend("notification_queue", event);

                System.out.println("✅ Изпратено напомняне на: " + request.getUsernameRequesting());

            } catch (Exception e) {
                System.err.println("❌ Грешка при пращане на напомняне за заявка " + request.getId() + ": " + e.getMessage());
            }
        }
    }
}
