package bg.schoolinventory.requestservice.service;

import bg.schoolinventory.requestservice.client.AuthClient;
import bg.schoolinventory.requestservice.client.EquipmentClient;
import bg.schoolinventory.requestservice.dto.EquipmentDTO;
import bg.schoolinventory.requestservice.dto.RequestCreateDTO;
import bg.schoolinventory.requestservice.dto.RequestResponseDTO;
import bg.schoolinventory.requestservice.enums.RequestStatus;
import bg.schoolinventory.requestservice.model.Request;
import bg.schoolinventory.requestservice.repository.RequestRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RequestServiceImplTest {

    @Mock private RequestRepository requestRepository;
    @Mock private EquipmentClient equipmentClient;
    @Mock private AuthClient authClient;
    @Mock private RabbitTemplate rabbitTemplate;

    @InjectMocks private RequestServiceImpl requestService;

    private Request testRequest;
    private EquipmentDTO testEquipment;

    @BeforeEach
    void setUp() {
        testRequest = new Request();
        testRequest.setId(1L);
        testRequest.setEquipmentID(3L);
        testRequest.setUsernameRequesting("Tsvetan");
        testRequest.setStatus(RequestStatus.PENDING);
        testRequest.setRequestDate(LocalDateTime.now());

        testEquipment = new EquipmentDTO();
        testEquipment.setName("Лаптоп Dell");
    }

    @Test
    void getAllRequests_ShouldReturnList() {
        when(requestRepository.findAll()).thenReturn(List.of(testRequest));
        when(equipmentClient.getEquipmentById(3L)).thenReturn(testEquipment);

        List<RequestResponseDTO> result = requestService.getAllRequests();

        assertEquals(1, result.size());
        assertEquals("Лаптоп Dell", result.getFirst().getEquipmentName());
    }

    @Test
    void createRequest_ShouldSaveAndSetStatusPending() {
        RequestCreateDTO dto = new RequestCreateDTO();
        dto.setEquipmentId(3L);
        dto.setBorrowStartTime(LocalDateTime.now().plusDays(1));
        dto.setBorrowEndTime(LocalDateTime.now().plusDays(5)); // Правилни дати

        when(requestRepository.save(any(Request.class))).thenReturn(testRequest);

        Request result = requestService.createRequest(dto, "Tsvetan");

        assertNotNull(result);
        verify(equipmentClient).updateEquipmentStatus(3L, "CHECKED_OUT");
        verify(requestRepository).save(any(Request.class));
    }

    @Test
    void createRequest_WithInvalidDates_ShouldThrowException() {
        RequestCreateDTO dto = new RequestCreateDTO();
        dto.setEquipmentId(3L);
        dto.setBorrowStartTime(LocalDateTime.now().plusDays(5));
        dto.setBorrowEndTime(LocalDateTime.now().plusDays(1));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            requestService.createRequest(dto, "Tsvetan");
        });

        assertTrue(exception.getMessage().contains("borrowing start time is after it's end time"));
    }

    @Test
    void approveRequest_ShouldChangeStatusToApprovedAndNotify() {
        when(requestRepository.findById(1L)).thenReturn(Optional.of(testRequest));
        when(equipmentClient.getEquipmentById(3L)).thenReturn(testEquipment);

        // Понеже AuthClient връща обект, който има .getEmail(), трябва да го симулираме дълбоко
        var mockUser = mock(bg.schoolinventory.requestservice.dto.UserDTO.class); // Смени UserDTO с твоя реален клас!
        when(mockUser.getEmail()).thenReturn("test@test.com");
        when(authClient.getUserByUsername("Tsvetan")).thenReturn(mockUser);

        when(requestRepository.save(any(Request.class))).thenReturn(testRequest);

        Request result = requestService.approveRequest(1L);

        assertEquals(RequestStatus.APPROVED, result.getStatus());
        verify(rabbitTemplate).convertAndSend(eq("notification_queue"), any(bg.schoolinventory.requestservice.dto.NotificationEvent.class));
    }

    @Test
    void returnEquipment_ShouldChangeStatusToReturnedAndMakeEquipmentAvailable() {
        when(requestRepository.findById(1L)).thenReturn(Optional.of(testRequest));
        when(requestRepository.save(any(Request.class))).thenReturn(testRequest);

        Request result = requestService.returnEquipment(1L, "Счупен екран");

        assertEquals(RequestStatus.RETURNED, result.getStatus());
        assertEquals("Счупен екран", result.getReturnCondition());
        verify(equipmentClient).updateEquipmentStatus(3L, "AVAILABLE"); // Проверяваме дали освобождава техниката
    }

    @Test
    void checkoutEquipment_WhenStatusIsNotApproved_ShouldThrowException() {
        testRequest.setStatus(RequestStatus.PENDING); // Опитваме се да вземем неодобрена заявка
        when(requestRepository.findById(1L)).thenReturn(Optional.of(testRequest));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            requestService.checkoutEquipment(1L);
        });

        assertTrue(exception.getMessage().contains("You can only check out APPROVED requests"));
    }

    @Test
    void cancelRequest_ShouldChangeToRejectedAndFreeEquipment() {
        testRequest.setStatus(RequestStatus.PENDING);
        when(requestRepository.findById(1L)).thenReturn(Optional.of(testRequest));
        when(requestRepository.save(any(Request.class))).thenReturn(testRequest);

        Request result = requestService.cancelRequest(1L);

        assertEquals(RequestStatus.REJECTED, result.getStatus());
        verify(equipmentClient).updateEquipmentStatus(3L, "AVAILABLE");
    }

    @Test
    void approveRequest_WhenRequestDoesNotExist_ShouldThrowException() {
        Long fakeId = 999L;
        when(requestRepository.findById(fakeId)).thenReturn(java.util.Optional.empty());

        assertThrows(RuntimeException.class, () -> {
            requestService.approveRequest(fakeId);
        });

    }
}