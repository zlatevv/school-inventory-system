package bg.schoolinventory.reportservice.dto;

import java.time.LocalDateTime;

public class HistoryReportDTO {
    private String username;
    private String equipmentName;
    private LocalDateTime requestDate;
    private LocalDateTime borrowStartTime;
    private LocalDateTime borrowEndTime;
    private String status;
    private LocalDateTime returnDate;
    private String returnCondition;

    public HistoryReportDTO() {}

    public HistoryReportDTO(String username, String equipmentName, LocalDateTime requestDate,
                           LocalDateTime borrowStartTime, LocalDateTime borrowEndTime, String status,
                           LocalDateTime returnDate, String returnCondition) {
        this.username = username;
        this.equipmentName = equipmentName;
        this.requestDate = requestDate;
        this.borrowStartTime = borrowStartTime;
        this.borrowEndTime = borrowEndTime;
        this.status = status;
        this.returnDate = returnDate;
        this.returnCondition = returnCondition;
    }

    // Getters and setters
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEquipmentName() {
        return equipmentName;
    }

    public void setEquipmentName(String equipmentName) {
        this.equipmentName = equipmentName;
    }

    public LocalDateTime getRequestDate() {
        return requestDate;
    }

    public void setRequestDate(LocalDateTime requestDate) {
        this.requestDate = requestDate;
    }

    public LocalDateTime getBorrowStartTime() {
        return borrowStartTime;
    }

    public void setBorrowStartTime(LocalDateTime borrowStartTime) {
        this.borrowStartTime = borrowStartTime;
    }

    public LocalDateTime getBorrowEndTime() {
        return borrowEndTime;
    }

    public void setBorrowEndTime(LocalDateTime borrowEndTime) {
        this.borrowEndTime = borrowEndTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getReturnDate() {
        return returnDate;
    }

    public void setReturnDate(LocalDateTime returnDate) {
        this.returnDate = returnDate;
    }

    public String getReturnCondition() {
        return returnCondition;
    }

    public void setReturnCondition(String returnCondition) {
        this.returnCondition = returnCondition;
    }
}