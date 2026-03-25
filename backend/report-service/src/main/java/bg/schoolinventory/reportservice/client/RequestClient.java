package bg.schoolinventory.reportservice.client;

import bg.schoolinventory.reportservice.dto.RequestDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@FeignClient(name = "request-service", url = "${request.service.url:http://localhost:8084}")
public interface RequestClient {

    @GetMapping("/api/manager/requests")
    List<RequestDTO> getAllRequests();
}