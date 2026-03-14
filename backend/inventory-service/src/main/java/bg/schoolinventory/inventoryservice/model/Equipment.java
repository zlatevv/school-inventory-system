package bg.schoolinventory.inventoryservice.model;

import bg.schoolinventory.inventoryservice.enums.Condition;
import bg.schoolinventory.inventoryservice.enums.EquipmentStatus;
import jakarta.persistence.*;

@Entity
@Table(name = "equipment")
public class Equipment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type;

    @Column(unique = true)
    private String serialNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Condition equipmentCondition;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EquipmentStatus equipmentStatus;

    public Equipment() {}

    public Equipment(Long id, String name, String type, String serialNumber,
                     Condition condition, EquipmentStatus equipmentStatus) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.serialNumber = serialNumber;
        this.equipmentCondition = condition;
        this.equipmentStatus = equipmentStatus;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
    }

    public Condition getEquipmentCondition() {
        return equipmentCondition;
    }

    public void setEquipmentCondition(Condition equipmentCondition) {
        this.equipmentCondition = equipmentCondition;
    }

    public EquipmentStatus getEquipmentStatus() {
        return equipmentStatus;
    }

    public void setEquipmentStatus(EquipmentStatus equipmentStatus) {
        this.equipmentStatus = equipmentStatus;
    }
}
