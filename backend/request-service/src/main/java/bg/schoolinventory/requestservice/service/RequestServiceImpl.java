package bg.schoolinventory.requestservice.service;

import bg.schoolinventory.requestservice.dto.RequestCreateDTO;
import bg.schoolinventory.requestservice.enums.RequestStatus;
import bg.schoolinventory.requestservice.model.Request;
import bg.schoolinventory.requestservice.repository.RequestRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RequestServiceImpl implements RequestService {
    public final RequestRepository requestRepository;

    public RequestServiceImpl(RequestRepository requestRepository) {
        this.requestRepository = requestRepository;
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

        return requestRepository.save(request);
    }

    @Override
    public List<Request> getMyRequests(String username) {
        return requestRepository.findAllByUsernameRequesting(username);
    }

    @Override
    public List<Request> getAllRequests() {
        return requestRepository.findAll();
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
}
