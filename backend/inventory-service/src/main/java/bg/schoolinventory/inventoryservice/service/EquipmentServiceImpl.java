package bg.schoolinventory.inventoryservice.service;

import bg.schoolinventory.inventoryservice.dto.EquipmentDTO;
import bg.schoolinventory.inventoryservice.enums.EquipmentStatus;
import bg.schoolinventory.inventoryservice.model.Equipment;
import bg.schoolinventory.inventoryservice.repository.EquipmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EquipmentServiceImpl implements EquipmentService {

    private final EquipmentRepository equipmentRepository;

    public EquipmentServiceImpl(EquipmentRepository equipmentRepository) {
        this.equipmentRepository = equipmentRepository;
    }

    @Override
    public List<Equipment> getAllEquipment() {
        return equipmentRepository.findAll();
    }

    @Override
    public Optional<Equipment> getEquipmentById(Long id) {
        return equipmentRepository.findById(id);
    }

    @Override
    public Equipment createEquipment(EquipmentDTO createDTO) {
        Equipment equipment = new Equipment();

        equipment.setName(createDTO.getName());
        equipment.setType(createDTO.getType());
        equipment.setSerialNumber(createDTO.getSerialNumber());
        equipment.setEquipmentCondition(createDTO.getCondition());
        equipment.setLocation(createDTO.getLocation());
        equipment.setPhotoURL(createDTO.getPhotoUrl());

        equipment.setEquipmentStatus(EquipmentStatus.AVAILABLE);

        return equipmentRepository.save(equipment);
    }

    @Override
    public Equipment updateEquipment(Long id, EquipmentDTO updateDTO) {
        Equipment existingEquipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error - equipment with id " + id + " not found!"));

        if (updateDTO.getName() != null) existingEquipment.setName(updateDTO.getName());
        if (updateDTO.getType() != null) existingEquipment.setType(updateDTO.getType());
        if (updateDTO.getSerialNumber() != null) existingEquipment.setSerialNumber(updateDTO.getSerialNumber());

        if (updateDTO.getCondition() != null) existingEquipment.setEquipmentCondition(updateDTO.getCondition());

        if (updateDTO.getLocation() != null) existingEquipment.setLocation(updateDTO.getLocation());
        if (updateDTO.getPhotoUrl() != null) existingEquipment.setPhotoURL(updateDTO.getPhotoUrl());
        if (updateDTO.getEquipmentStatus() != null) existingEquipment.setEquipmentStatus(updateDTO.getEquipmentStatus());

        return equipmentRepository.save(existingEquipment);
    }

    @Override
    public Equipment updateEquipmentStatus(Long id, EquipmentStatus newStatus) {// 1. Намираме предмета
        Equipment existingEquipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error - equipment with id " + id + " not found!"));

        existingEquipment.setEquipmentStatus(newStatus);

        return equipmentRepository.save(existingEquipment);
    }

    @Override
    public void deleteEquipment(Long id) {
        Equipment existingEquipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error - equipment not present!"));

        equipmentRepository.delete(existingEquipment);
    }
}