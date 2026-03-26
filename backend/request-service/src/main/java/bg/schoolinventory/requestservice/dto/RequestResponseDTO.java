package bg.schoolinventory.requestservice.dto;

import bg.schoolinventory.requestservice.enums.RequestStatus;
import java.time.LocalDateTime;

public class RequestResponseDTO {
    private Long id;
    private RequestStatus status;
    private LocalDateTime requestDate;
    private LocalDateTime borrowStartTime;
    private LocalDateTime borrowEndTime;
    private String returnCondition;
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
    public LocalDateTime getBorrowStartTime() { return borrowStartTime; }
    public void setBorrowStartTime(LocalDateTime borrowStartTime) { this.borrowStartTime = borrowStartTime; }
    public LocalDateTime getBorrowEndTime() { return borrowEndTime; }
    public void setBorrowEndTime(LocalDateTime borrowEndTime) { this.borrowEndTime = borrowEndTime; }
    public String getReturnCondition() { return returnCondition; }
    public void setReturnCondition(String returnCondition) { this.returnCondition = returnCondition; }
    public String getEquipmentName() { return equipmentName; }
    public void setEquipmentName(String equipmentName) { this.equipmentName = equipmentName; }

    public String getUsernameRequesting() {
        return usernameRequesting;
    }

    public void setUsernameRequesting(String usernameRequesting) {
        this.usernameRequesting = usernameRequesting;
    }
}
