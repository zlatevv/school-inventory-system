package bg.schoolinventory.requestservice.service;

import bg.schoolinventory.requestservice.dto.RequestCreateDTO;
import bg.schoolinventory.requestservice.dto.RequestResponseDTO;
import bg.schoolinventory.requestservice.model.Request;
import jakarta.transaction.Transactional;

import java.util.List;

public interface RequestService {
    Request createRequest(RequestCreateDTO dto, String username);
    Request cancelRequest(Long requestId);
    List<RequestResponseDTO> getMyRequests(String username);
    List<RequestResponseDTO> getAllRequests();

    @Transactional
    Request rejectRequest(Long requestId);
    @Transactional
    Request approveRequest(Long requestId);

    Request returnEquipment(Long requestId, String condition);
    Request checkoutEquipment(Long requestId);
}
