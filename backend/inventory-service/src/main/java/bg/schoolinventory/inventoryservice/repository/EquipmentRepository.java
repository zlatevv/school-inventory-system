package bg.schoolinventory.inventoryservice.repository;

import bg.schoolinventory.inventoryservice.model.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
}
