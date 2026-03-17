package bg.schoolinventory.reportservice.dto;

import java.time.LocalDateTime;

public class UsageReportDTO {
    private String equipmentName;
    private String equipmentType;
    private Long totalRequests;
    private Long approvedRequests;
    private Long returnedRequests;
    private Double averageBorrowDuration; // in hours
    private LocalDateTime lastUsed;

    public UsageReportDTO() {}

    public UsageReportDTO(String equipmentName, String equipmentType, Long totalRequests,
                         Long approvedRequests, Long returnedRequests, Double averageBorrowDuration,
                         LocalDateTime lastUsed) {
        this.equipmentName = equipmentName;
        this.equipmentType = equipmentType;
        this.totalRequests = totalRequests;
        this.approvedRequests = approvedRequests;
        this.returnedRequests = returnedRequests;
        this.averageBorrowDuration = averageBorrowDuration;
        this.lastUsed = lastUsed;
    }

    // Getters and setters
    public String getEquipmentName() {
        return equipmentName;
    }

    public void setEquipmentName(String equipmentName) {
        this.equipmentName = equipmentName;
    }

    public String getEquipmentType() {
        return equipmentType;
    }

    public void setEquipmentType(String equipmentType) {
        this.equipmentType = equipmentType;
    }

    public Long getTotalRequests() {
        return totalRequests;
    }

    public void setTotalRequests(Long totalRequests) {
        this.totalRequests = totalRequests;
    }

    public Long getApprovedRequests() {
        return approvedRequests;
    }

    public void setApprovedRequests(Long approvedRequests) {
        this.approvedRequests = approvedRequests;
    }

    public Long getReturnedRequests() {
        return returnedRequests;
    }

    public void setReturnedRequests(Long returnedRequests) {
        this.returnedRequests = returnedRequests;
    }

    public Double getAverageBorrowDuration() {
        return averageBorrowDuration;
    }

    public void setAverageBorrowDuration(Double averageBorrowDuration) {
        this.averageBorrowDuration = averageBorrowDuration;
    }

    public LocalDateTime getLastUsed() {
        return lastUsed;
    }

    public void setLastUsed(LocalDateTime lastUsed) {
        this.lastUsed = lastUsed;
    }
}