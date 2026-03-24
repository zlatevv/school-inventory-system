package bg.schoolinventory.requestservice.service;

import bg.schoolinventory.requestservice.client.AuthClient;
import bg.schoolinventory.requestservice.client.EquipmentClient;
import bg.schoolinventory.requestservice.dto.EquipmentDTO;
import bg.schoolinventory.requestservice.dto.NotificationEvent;
import bg.schoolinventory.requestservice.dto.RequestCreateDTO;
import bg.schoolinventory.requestservice.dto.RequestResponseDTO;
import bg.schoolinventory.requestservice.enums.RequestStatus;
import bg.schoolinventory.requestservice.model.Request;
import bg.schoolinventory.requestservice.repository.RequestRepository;
import jakarta.transaction.Transactional;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RequestServiceImpl implements RequestService {
    private final RequestRepository requestRepository;
    private final EquipmentClient equipmentClient;
    private final AuthClient authClient;
    private final RabbitTemplate rabbitTemplate;

    public RequestServiceImpl(RequestRepository requestRepository, EquipmentClient equipmentClient, AuthClient authClient, RabbitTemplate rabbitTemplate) {
        this.requestRepository = requestRepository;
        this.equipmentClient = equipmentClient;
        this.authClient = authClient;
        this.rabbitTemplate = rabbitTemplate;
    }

    @Override
    public List<RequestResponseDTO> getAllRequests() {
        return requestRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Request createRequest(RequestCreateDTO dto, String username) {
        LocalDateTime borrowStartTime = dto.getBorrowStartTime();
        LocalDateTime borrowEndTime = dto.getBorrowEndTime();
        Long equipmentId = dto.getEquipmentId();

        if (borrowStartTime.isAfter(borrowEndTime)){
            throw new RuntimeException("Error - borrowing start time is after it's end time!");
        }

        Request request = new Request();
        request.setEquipmentID(equipmentId);
        request.setUsernameRequesting(username);
        request.setRequestDate(LocalDateTime.now());
        request.setBorrowStartTime(borrowStartTime);
        request.setBorrowEndTime(borrowEndTime);
        request.setStatus(RequestStatus.PENDING);
        equipmentClient.updateEquipmentStatus(equipmentId, "CHECKED_OUT");
        return requestRepository.save(request);
    }

    @Override
    public List<RequestResponseDTO> getMyRequests(String username) {
        List<Request> requests = requestRepository.findAllByUsernameRequesting(username);

        return requests.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Request approveRequest(Long requestId) {
        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Error - request does not exist!"));

        request.setStatus(RequestStatus.APPROVED);

        String equipmentName = equipmentClient.getEquipmentById(request.getEquipmentID()).getName();
        String email = authClient.getUserByUsername(request.getUsernameRequesting()).getEmail();

        String longMessage = String.format(
                "Your request for '%s' has been APPROVED! ✅\n\n" +
                        "What to do next:\n" +
                        "1. Please visit the equipment desk during working hours.\n" +
                        "2. Present your barcode or ID for scanning.\n" +
                        "3. Once the staff scans the item, it will be officially assigned to you.\n\n" +
                        "Note: This approval is valid for 24 hours. If not picked up, the item will become available again.",
                equipmentName
        );

        sendNotification(request.getUsernameRequesting(), "Request Approval " + equipmentName, longMessage, email);
        return requestRepository.save(request);
    }

    @Transactional
    @Override
    public Request rejectRequest(Long requestId) {
        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Error - request does not exist!"));

        request.setStatus(RequestStatus.REJECTED);

        String equipmentName = equipmentClient.getEquipmentById(request.getEquipmentID()).getName();
        String email = authClient.getUserByUsername(request.getUsernameRequesting()).getEmail();

        equipmentClient.updateEquipmentStatus(request.getEquipmentID(), "AVAILABLE");

        String longMessage = String.format(
                "We regret to inform you that your request for the '%s' has been declined at this time.\n\n" +
                        "Reasoning:\n" +
                        "This decision is typically made due to scheduled maintenance, priority scheduling for faculty, or inventory limits. " +
                        "Your account remains in good standing, and you are welcome to submit a new request for a different time slot or another item.\n\n" +
                        "If you believe this is a mistake, please contact the System Administrator.",
                equipmentName
        );

        sendNotification(
                request.getUsernameRequesting(),
                "Request Declined: " + equipmentName, // Смени "Approval Notice" с това
                longMessage,
                email
        );
        return requestRepository.save(request);
    }

    @Override
    @Transactional
    public Request returnEquipment(Long requestId, String condition) {
        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Error - request does not exist!"));

        request.setStatus(RequestStatus.RETURNED);
        request.setReturnCondition(condition);
        equipmentClient.updateEquipmentStatus(request.getEquipmentID(), "AVAILABLE");

        return requestRepository.save(request);
    }

    @Override
    public Request checkoutEquipment(Long requestId) {
        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Error - request does not exist!"));

        if (request.getStatus() != RequestStatus.APPROVED) {
            throw new RuntimeException("Error - You can only check out APPROVED requests. Current status: " + request.getStatus());
        }

        request.setStatus(RequestStatus.CHECKED_OUT);

        String equipmentName = equipmentClient.getEquipmentById(request.getEquipmentID()).getName();
        String email = authClient.getUserByUsername(request.getUsernameRequesting()).getEmail();

        equipmentClient.updateEquipmentStatus(request.getEquipmentID(), "CHECKED_OUT");

        sendNotification(
                request.getUsernameRequesting(),
                "Equipment Checked Out", // Сменено от Request Rejection
                "Great news! Your request for the " + equipmentName + " has been checked out successfully and is now in your possession.",
                email
        );

        // 6. Запазваме промените в базата
        return requestRepository.save(request);
    }

    @Override
    @Transactional
    public Request cancelRequest(Long requestId) {
        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Error - request does not exist!"));

        if (request.getStatus() != RequestStatus.PENDING){
            throw new RuntimeException("Error - can only cancel pending requests!");
        }

        request.setStatus(RequestStatus.REJECTED);
        equipmentClient.updateEquipmentStatus(request.getEquipmentID(), "AVAILABLE");

        return requestRepository.save(request);
    }

    private RequestResponseDTO mapToResponseDTO(Request req) {
        RequestResponseDTO dto = new RequestResponseDTO();

        dto.setId(req.getId());
        dto.setStatus(req.getStatus());
        dto.setRequestDate(req.getRequestDate());
        dto.setEquipmentID(req.getEquipmentID());
        dto.setUsernameRequesting(req.getUsernameRequesting());

        try {
            EquipmentDTO equipment = equipmentClient.getEquipmentById(req.getEquipmentID());
            dto.setEquipmentName(equipment.getName());
        } catch (feign.FeignException.NotFound e) {
            System.out.println("Предметът с ID " + req.getEquipmentID() + " липсва: " + e.getMessage());
            dto.setEquipmentName("Изтрит предмет (ID: " + req.getEquipmentID() + ")");
        } catch (Exception e) {
            System.out.println("Грешка при връзката с Equipment Service: " + e.getMessage());
            dto.setEquipmentName("Неизвестна техника");
        }

        return dto;
    }

    private void sendNotification(String username, String title, String message, String email) {
        try {
            NotificationEvent event = new NotificationEvent(username, title, message, email);
            rabbitTemplate.convertAndSend("notification_queue", event);
            System.out.println("Нотификация пратена за потребител: " + username);
        } catch (Exception e) {
            System.err.println("Грешка при изпращане към RabbitMQ: " + e.getMessage());
        }
    }
}
