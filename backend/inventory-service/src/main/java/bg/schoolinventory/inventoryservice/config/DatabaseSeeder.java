package bg.schoolinventory.inventoryservice.config;

import bg.schoolinventory.inventoryservice.model.Equipment;
import bg.schoolinventory.inventoryservice.repository.EquipmentRepository;
import bg.schoolinventory.inventoryservice.enums.Condition;
import bg.schoolinventory.inventoryservice.enums.EquipmentStatus;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final EquipmentRepository equipmentRepository;

    public DatabaseSeeder(EquipmentRepository equipmentRepository) {
        this.equipmentRepository = equipmentRepository;
    }

    @Override
    public void run(String... args) {
        // Проверяваме дали базата е празна
        if (equipmentRepository.count() == 0) {
            System.out.println("🌱 Database is empty. Seeding a large batch of equipment with real photos...");

            List<Equipment> initialEquipment = Arrays.asList(
                    // Лаптопи
                    new Equipment(null, "Dell Latitude 5520", "Laptop", "SN-LAP-001", Condition.NEW, EquipmentStatus.AVAILABLE, "IT Lab 1", "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80"),
                    new Equipment(null, "Lenovo ThinkPad T14", "Laptop", "SN-LAP-002", Condition.GOOD, EquipmentStatus.AVAILABLE, "Room 204", "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80"),
                    new Equipment(null, "Apple MacBook Air M1", "Laptop", "SN-LAP-003", Condition.NEW, EquipmentStatus.AVAILABLE, "Teachers Lounge", "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80"),
                    new Equipment(null, "HP ProBook 450", "Laptop", "SN-LAP-004", Condition.GOOD, EquipmentStatus.AVAILABLE, "IT Lab 2", "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80"),
                    new Equipment(null, "Asus ZenBook 14", "Laptop", "SN-LAP-005", Condition.NEW, EquipmentStatus.AVAILABLE, "Library", "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&q=80"),

                    // Проектори и Екрани
                    new Equipment(null, "BenQ MW560", "Projector", "SN-PROJ-002", Condition.GOOD, EquipmentStatus.AVAILABLE, "Room 305", "https://images.unsplash.com/photo-1540655037529-dec987208707?w=800&q=80"),
                    new Equipment(null, "Smart Board 6000S", "Interactive Display", "SN-DISP-001", Condition.NEW, EquipmentStatus.AVAILABLE, "Room 202", "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&q=80"),

                    // Таблети
                    new Equipment(null, "iPad 10th Gen", "Tablet", "SN-TAB-001", Condition.NEW, EquipmentStatus.AVAILABLE, "Art Room", "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80"),
                    new Equipment(null, "Samsung Galaxy Tab S7", "Tablet", "SN-TAB-002", Condition.GOOD, EquipmentStatus.AVAILABLE, "Library", "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=800&q=80"),
                    new Equipment(null, "Lenovo Tab M10", "Tablet", "SN-TAB-003", Condition.GOOD, EquipmentStatus.AVAILABLE, "Science Lab", "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&q=80"),

                    // Лабораторно и друго оборудване
                    new Equipment(null, "Leica DM500 Microscope", "Science Equipment", "SN-SCI-001", Condition.NEW, EquipmentStatus.AVAILABLE, "Science Lab", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80"),
                    new Equipment(null, "Arduino Starter Kit", "Robotics", "SN-ROB-001", Condition.GOOD, EquipmentStatus.AVAILABLE, "IT Lab 1", "https://images.unsplash.com/photo-1553406830-ef2513450d76?w=800&q=80"),
                    new Equipment(null, "Canon EOS 90D", "Camera", "SN-CAM-001", Condition.NEW, EquipmentStatus.AVAILABLE, "Media Room", "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80"),
                    new Equipment(null, "Brother HL-L2350DW", "Printer", "SN-PRN-001", Condition.GOOD, EquipmentStatus.AVAILABLE, "Staff Room", "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800&q=80")
            );

            equipmentRepository.saveAll(initialEquipment);

            System.out.println("Database successfully seeded with " + initialEquipment.size() + " equipment items!");
        } else {
            System.out.println("Database already contains data. Seeding skipped.");
        }
    }
}