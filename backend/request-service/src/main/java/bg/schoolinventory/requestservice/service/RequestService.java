package bg.schoolinventory.requestservice.service;

import bg.schoolinventory.requestservice.dto.RequestCreateDTO;
import bg.schoolinventory.requestservice.model.Request;

import java.util.List;

public interface RequestService {
    Request createRequest(RequestCreateDTO dto, String username);
    List<Request> getMyRequests(String username);
    List<Request> getAllRequests();
    Request approveRequest(Long requestId);
    Request rejectRequest(Long requestId);
    Request returnEquipment(Long requestId, String condition);
}
