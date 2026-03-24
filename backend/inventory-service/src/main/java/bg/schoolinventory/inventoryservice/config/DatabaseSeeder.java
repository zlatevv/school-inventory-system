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
    public void run(String... args) throws Exception {
        // Проверяваме дали базата е празна
        if (equipmentRepository.count() == 0) {
            System.out.println("🌱 Database is empty. Seeding a large batch of equipment...");

            List<Equipment> initialEquipment = Arrays.asList(
                    // Лаптопи
                    new Equipment(null, "Dell Latitude 5520", "Laptop", "SN-LAP-001", Condition.NEW, EquipmentStatus.AVAILABLE, "IT Lab 1", "https://placehold.co/600x400/1a1a1a/FFF?text=Dell+Latitude"),
                    new Equipment(null, "Lenovo ThinkPad T14", "Laptop", "SN-LAP-002", Condition.GOOD, EquipmentStatus.CHECKED_OUT, "Room 204", "https://placehold.co/600x400/1a1a1a/FFF?text=Lenovo+ThinkPad"),
                    new Equipment(null, "Apple MacBook Air M1", "Laptop", "SN-LAP-003", Condition.NEW, EquipmentStatus.AVAILABLE, "Teachers Lounge", "https://placehold.co/600x400/1a1a1a/FFF?text=MacBook+Air"),
                    new Equipment(null, "HP ProBook 450", "Laptop", "SN-LAP-004", Condition.GOOD, EquipmentStatus.AVAILABLE, "IT Lab 2", "https://placehold.co/600x400/1a1a1a/FFF?text=HP+ProBook"),
                    new Equipment(null, "Asus ZenBook 14", "Laptop", "SN-LAP-005", Condition.NEW, EquipmentStatus.AVAILABLE, "Library", "https://placehold.co/600x400/1a1a1a/FFF?text=Asus+ZenBook"),

                    // Проектори и Екрани
                    new Equipment(null, "Epson EB-X51", "Projector", "SN-PROJ-001", Condition.GOOD, EquipmentStatus.AVAILABLE, "Room 101", "https://placehold.co/600x400/2b2b2b/FFF?text=Epson+Projector"),
                    new Equipment(null, "BenQ MW560", "Projector", "SN-PROJ-002", Condition.GOOD, EquipmentStatus.CHECKED_OUT, "Room 305", "https://placehold.co/600x400/2b2b2b/FFF?text=BenQ+Projector"),
                    new Equipment(null, "Smart Board 6000S", "Interactive Display", "SN-DISP-001", Condition.NEW, EquipmentStatus.AVAILABLE, "Room 202", "https://placehold.co/600x400/2b2b2b/FFF?text=Smart+Board"),

                    // Таблети
                    new Equipment(null, "iPad 10th Gen", "Tablet", "SN-TAB-001", Condition.NEW, EquipmentStatus.AVAILABLE, "Art Room", "https://placehold.co/600x400/4a4a4a/FFF?text=Apple+iPad"),
                    new Equipment(null, "Samsung Galaxy Tab S7", "Tablet", "SN-TAB-002", Condition.GOOD, EquipmentStatus.AVAILABLE, "Library", "https://placehold.co/600x400/4a4a4a/FFF?text=Galaxy+Tab"),
                    new Equipment(null, "Lenovo Tab M10", "Tablet", "SN-TAB-003", Condition.GOOD, EquipmentStatus.CHECKED_OUT, "Science Lab", "https://placehold.co/600x400/4a4a4a/FFF?text=Lenovo+Tab"),

                    // Лабораторно и друго оборудване
                    new Equipment(null, "Leica DM500 Microscope", "Science Equipment", "SN-SCI-001", Condition.NEW, EquipmentStatus.AVAILABLE, "Science Lab", "https://placehold.co/600x400/802b2b/FFF?text=Microscope"),
                    new Equipment(null, "Arduino Starter Kit", "Robotics", "SN-ROB-001", Condition.GOOD, EquipmentStatus.AVAILABLE, "IT Lab 1", "https://placehold.co/600x400/2b5c80/FFF?text=Arduino+Kit"),
                    new Equipment(null, "Canon EOS 90D", "Camera", "SN-CAM-001", Condition.NEW, EquipmentStatus.AVAILABLE, "Media Room", "https://placehold.co/600x400/2b8045/FFF?text=Canon+Camera"),
                    new Equipment(null, "Brother HL-L2350DW", "Printer", "SN-PRN-001", Condition.GOOD, EquipmentStatus.AVAILABLE, "Staff Room", "https://placehold.co/600x400/80782b/FFF?text=Brother+Printer")
            );

            equipmentRepository.saveAll(initialEquipment);

            System.out.println("Database successfully seeded with " + initialEquipment.size() + " equipment items!");
        } else {
            System.out.println("Database already contains data. Seeding skipped.");
        }
    }
}