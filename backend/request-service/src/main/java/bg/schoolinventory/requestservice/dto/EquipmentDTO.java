package bg.schoolinventory.requestservice.dto;

public class EquipmentDTO {
    private Long id;
    private String name;
    private Long EquipmentID;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getEquipmentID() {
        return EquipmentID;
    }

    public void setEquipmentID(Long equipmentID) {
        EquipmentID = equipmentID;
    }
}