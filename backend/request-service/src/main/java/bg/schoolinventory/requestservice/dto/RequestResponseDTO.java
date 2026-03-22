package bg.schoolinventory.requestservice.dto;

import bg.schoolinventory.requestservice.enums.RequestStatus;
import java.time.LocalDateTime;

public class RequestResponseDTO {
    private Long id;
    private RequestStatus status;
    private LocalDateTime requestDate;
    private String equipmentName;
    private Long equipmentID;
    private String usernameRequesting;

    public RequestResponseDTO() {}

    public Long getEquipmentID() {
        return equipmentID;
    }

    public void setEquipmentID(Long equipmentID) {
        this.equipmentID = equipmentID;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public RequestStatus getStatus() { return status; }
    public void setStatus(RequestStatus status) { this.status = status; }
    public LocalDateTime getRequestDate() { return requestDate; }
    public void setRequestDate(LocalDateTime requestDate) { this.requestDate = requestDate; }
    public String getEquipmentName() { return equipmentName; }
    public void setEquipmentName(String equipmentName) { this.equipmentName = equipmentName; }

    public String getUsernameRequesting() {
        return usernameRequesting;
    }

    public void setUsernameRequesting(String usernameRequesting) {
        this.usernameRequesting = usernameRequesting;
    }
}