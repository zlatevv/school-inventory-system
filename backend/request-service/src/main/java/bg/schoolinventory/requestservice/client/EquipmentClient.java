package bg.schoolinventory.requestservice.client;

import bg.schoolinventory.requestservice.dto.EquipmentDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "equipment-service", url = "http://localhost:8081")
public interface EquipmentClient {

    @GetMapping("/api/equipment/{id}")
    EquipmentDTO getEquipmentById(@PathVariable("id") Long id);

}