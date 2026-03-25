package bg.schoolinventory.inventoryservice.controller;

import bg.schoolinventory.inventoryservice.dto.EquipmentDTO;
import bg.schoolinventory.inventoryservice.enums.EquipmentStatus;
import bg.schoolinventory.inventoryservice.model.Equipment;
import bg.schoolinventory.inventoryservice.service.EquipmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipment")
public class InventoryController {
    private final EquipmentService equipmentService;

    public InventoryController(EquipmentService equipmentService) {
        this.equipmentService = equipmentService;
    }

    @GetMapping
    public ResponseEntity<List<Equipment>> getAllEquipment() {
        List<Equipment> equipment = equipmentService.getAllEquipment();
        return ResponseEntity.ok(equipment);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Equipment> getEquipmentById(@PathVariable Long id) {
        return equipmentService.getEquipmentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Equipment> createEquipment(@RequestBody EquipmentDTO equipmentDTO){
        Equipment equipment = equipmentService.createEquipment(equipmentDTO);

        return ResponseEntity.ok(equipment);
    }

    @PutMapping("/{id}")
<<<<<<< HEAD
    public ResponseEntity<Equipment> updateEquipment(@PathVariable("id") Long id,
                                                     @RequestBody EquipmentDTO equipmentDTO){
=======
    public ResponseEntity<Equipment> updateEquipment(
            @PathVariable("id") Long id,
            @RequestBody EquipmentDTO equipmentDTO
    ){
>>>>>>> 70450907762805fcf17aaaf5b515bae2a33b2192
        Equipment equipment = equipmentService.updateEquipment(id, equipmentDTO);

        return ResponseEntity.ok(equipment);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Equipment> updateEquipmentStatus(
            @PathVariable("id") Long id,
            @RequestParam("newStatus") EquipmentStatus newStatus) {

        Equipment equipment = equipmentService.updateEquipmentStatus(id, newStatus);
        return ResponseEntity.ok(equipment);
    }

    @DeleteMapping("/{id}")
<<<<<<< HEAD
    public void  deleteEquipment(@PathVariable Long id){
=======
    public void  deleteEquipment(@PathVariable("id") Long id){
>>>>>>> 70450907762805fcf17aaaf5b515bae2a33b2192
        equipmentService.deleteEquipment(id);
    }
}
