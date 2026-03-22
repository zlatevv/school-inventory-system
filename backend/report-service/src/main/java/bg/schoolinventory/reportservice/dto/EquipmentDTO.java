package bg.schoolinventory.reportservice.dto;

import bg.schoolinventory.reportservice.enums.Condition;

public class EquipmentDTO {

    private Long id;
    private String name;
    private String type;
    private String serialNumber;
    private Condition condition;
    private String location;
    private String photoUrl;

    public EquipmentDTO() {}

    public EquipmentDTO(Long id, String name, String type, String serialNumber,
                       Condition condition, String location, String photoUrl) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.serialNumber = serialNumber;
        this.condition = condition;
        this.location = location;
        this.photoUrl = photoUrl;
    }

    // --- Getters and Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getSerialNumber() { return serialNumber; }
    public void setSerialNumber(String serialNumber) { this.serialNumber = serialNumber; }

    public Condition getCondition() {
        return condition;
    }

    public void setCondition(Condition condition) {
        this.condition = condition;
    }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
}