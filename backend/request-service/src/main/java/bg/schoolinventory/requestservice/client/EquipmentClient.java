package bg.schoolinventory.requestservice.client;

import bg.schoolinventory.requestservice.dto.EquipmentDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "inventory-service", url = "${inventory.service.url:http://localhost:8081}")
public interface EquipmentClient {

    @GetMapping("/api/equipment/{id}")
    EquipmentDTO getEquipmentById(@PathVariable("id") Long id);

    @PutMapping("/api/equipment/{id}/status")
    void updateEquipmentStatus(@PathVariable("id") Long id, @RequestParam("newStatus") String newStatus);
}