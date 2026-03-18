package bg.schoolinventory.requestservice.service;

import bg.schoolinventory.requestservice.client.EquipmentClient;
import bg.schoolinventory.requestservice.dto.EquipmentDTO;
import bg.schoolinventory.requestservice.dto.RequestCreateDTO;
import bg.schoolinventory.requestservice.dto.RequestResponseDTO;
import bg.schoolinventory.requestservice.enums.RequestStatus;
import bg.schoolinventory.requestservice.model.Request;
import bg.schoolinventory.requestservice.repository.RequestRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RequestServiceImpl implements RequestService {
    private final RequestRepository requestRepository;
    private final EquipmentClient equipmentClient;

    public RequestServiceImpl(RequestRepository requestRepository, EquipmentClient equipmentClient) {
        this.requestRepository = requestRepository;
        this.equipmentClient = equipmentClient;
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
    public Request approveRequest(Long requestId) {
        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Error - request does not exist!"));

        request.setStatus(RequestStatus.APPROVED);
        return requestRepository.save(request);
    }

    @Override
    public Request rejectRequest(Long requestId) {
        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Error - request does not exist!"));

        request.setStatus(RequestStatus.REJECTED);
        return requestRepository.save(request);
    }

    @Override
    public Request returnEquipment(Long requestId, String condition) {
        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Error - request does not exist!"));

        if (request.getStatus() != RequestStatus.APPROVED){
            throw new RuntimeException("Error - cannot return equipment that was not approved!");
        }

        request.setStatus(RequestStatus.RETURNED);
        request.setReturnCondition(condition);

        return requestRepository.save(request);
    }

    @Override
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
        EquipmentDTO equipment = equipmentClient.getEquipmentById(req.getEquipmentID());

        RequestResponseDTO dto = new RequestResponseDTO();
        dto.setId(req.getId());
        dto.setStatus(req.getStatus());
        dto.setRequestDate(req.getRequestDate());
        dto.setEquipmentID(req.getEquipmentID());
        dto.setEquipmentName(equipment.getName());

        return dto;
    }
}
