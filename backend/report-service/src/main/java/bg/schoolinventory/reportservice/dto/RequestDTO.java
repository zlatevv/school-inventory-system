package bg.schoolinventory.reportservice.dto;

import bg.schoolinventory.reportservice.enums.RequestStatus;
import java.time.LocalDateTime;

public class RequestDTO {
    private Long id;
    private String usernameRequesting;
    private Long equipmentID;
    private String returnCondition;
    private LocalDateTime requestDate;
    private LocalDateTime borrowStartTime;
    private LocalDateTime borrowEndTime;
    private RequestStatus status;

    public RequestDTO() {}

    public RequestDTO(Long id, String usernameRequesting, Long equipmentID, String returnCondition,
                     LocalDateTime requestDate, LocalDateTime borrowStartTime, LocalDateTime borrowEndTime,
                     RequestStatus status) {
        this.id = id;
        this.usernameRequesting = usernameRequesting;
        this.equipmentID = equipmentID;
        this.returnCondition = returnCondition;
        this.requestDate = requestDate;
        this.borrowStartTime = borrowStartTime;
        this.borrowEndTime = borrowEndTime;
        this.status = status;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsernameRequesting() { return usernameRequesting; }
    public void setUsernameRequesting(String usernameRequesting) { this.usernameRequesting = usernameRequesting; }

    public Long getEquipmentID() { return equipmentID; }
    public void setEquipmentID(Long equipmentID) { this.equipmentID = equipmentID; }

    public String getReturnCondition() { return returnCondition; }
    public void setReturnCondition(String returnCondition) { this.returnCondition = returnCondition; }

    public LocalDateTime getRequestDate() { return requestDate; }
    public void setRequestDate(LocalDateTime requestDate) { this.requestDate = requestDate; }

    public LocalDateTime getBorrowStartTime() { return borrowStartTime; }
    public void setBorrowStartTime(LocalDateTime borrowStartTime) { this.borrowStartTime = borrowStartTime; }

    public LocalDateTime getBorrowEndTime() { return borrowEndTime; }
    public void setBorrowEndTime(LocalDateTime borrowEndTime) { this.borrowEndTime = borrowEndTime; }

    public RequestStatus getStatus() { return status; }
    public void setStatus(RequestStatus status) { this.status = status; }
}