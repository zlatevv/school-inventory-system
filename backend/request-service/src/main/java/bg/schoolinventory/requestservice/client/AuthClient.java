package bg.schoolinventory.requestservice.client;

import bg.schoolinventory.requestservice.dto.UserDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "auth-service", url = "${auth.service.url:http://localhost:8080}")
public interface AuthClient {

    @GetMapping("/api/auth/users/{username}")
    UserDTO getUserByUsername(@PathVariable("username") String username);
}