package bg.schoolinventory.reportservice.client;

import bg.schoolinventory.reportservice.dto.EquipmentDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "inventory-service", url = "http://localhost:8081")
public interface EquipmentClient {

    @GetMapping("/api/equipment")
    List<EquipmentDTO> getAllEquipment();

    @GetMapping("/api/equipment/{id}")
    EquipmentDTO getEquipmentById(@PathVariable("id") Long id);
}