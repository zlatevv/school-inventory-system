package bg.schoolinventory.inventoryservice.service;

import bg.schoolinventory.inventoryservice.dto.EquipmentDTO;
import bg.schoolinventory.inventoryservice.enums.EquipmentStatus;
import bg.schoolinventory.inventoryservice.model.Equipment;

import java.util.List;
import java.util.Optional;

public interface EquipmentService {

    List<Equipment> getAllEquipment();

    Optional<Equipment> getEquipmentById(Long id);

    Equipment createEquipment(EquipmentDTO createDTO);

    Equipment updateEquipment(Long id, EquipmentDTO updateDTO);

    Equipment updateEquipmentStatus(Long id, EquipmentStatus equipmentStatus);

    void deleteEquipment(Long id);
}