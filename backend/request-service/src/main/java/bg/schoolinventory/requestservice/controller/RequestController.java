package bg.schoolinventory.requestservice.controller;

import bg.schoolinventory.requestservice.dto.RequestCreateDTO;
import bg.schoolinventory.requestservice.dto.RequestResponseDTO;
import bg.schoolinventory.requestservice.model.Request;
import bg.schoolinventory.requestservice.service.RequestService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class RequestController {
    private final RequestService requestService;

    public RequestController(RequestService requestService) {
        this.requestService = requestService;
    }

    @PostMapping("/request")
    public ResponseEntity<Request> createRequest(
            @Valid @RequestBody RequestCreateDTO dto,
            JwtAuthenticationToken token) {
        String username = token.getName();

        Request request = requestService.createRequest(dto, username);

        return ResponseEntity.ok(request);
    }

    @GetMapping("/requests")
    public ResponseEntity<List<RequestResponseDTO>> getMyRequests(JwtAuthenticationToken token) {
        String username = token.getName();
        List<RequestResponseDTO> requests = requestService.getMyRequests(username);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/manager/requests")
    public ResponseEntity<List<RequestResponseDTO>> getAllRequests() {
        List<RequestResponseDTO> request = requestService.getAllRequests();
        return ResponseEntity.ok(request);
    }

    @PutMapping("/request/{id}/approve")
    public ResponseEntity<Request> approveRequest(@PathVariable Long id) {
        Request request = requestService.approveRequest(id);

        return ResponseEntity.ok(request);
    }

    @PutMapping("/request/{id}/reject")
    public ResponseEntity<Request> rejectRequest(@PathVariable Long id) {
        Request request = requestService.rejectRequest(id);

        return ResponseEntity.ok(request);
    }

    @PutMapping("/request/{id}/return")
    public ResponseEntity<Request> returnEquipment(
            @PathVariable Long id,
            @RequestParam(defaultValue = "Върнато без забележки") String condition)
    {
        Request request = requestService.returnEquipment(id, condition);

        return ResponseEntity.ok(request);
    }

    @PutMapping("/request/{id}/cancel")
    public ResponseEntity<Request> cancelRequest(@PathVariable Long id) {
        Request request = requestService.cancelRequest(id);
        return ResponseEntity.ok(request);
    }
}
