package bg.schoolinventory.requestservice.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDateTime;

public class RequestCreateDTO {
    @NotNull(message = "Equipment ID is required")
    @Positive(message = "Equipment ID must be a positive number")
    private Long equipmentId;

    @NotNull(message = "Start time is required")
    @FutureOrPresent(message = "Start time cannot be in the past")
    private LocalDateTime borrowStartTime;

    @NotNull(message = "End time is required")
    private LocalDateTime borrowEndTime;

    public RequestCreateDTO(Long equipmentId, LocalDateTime borrowStartTime, LocalDateTime borrowEndTime) {
        this.equipmentId = equipmentId;
        this.borrowStartTime = borrowStartTime;
        this.borrowEndTime = borrowEndTime;
    }

    public Long getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(Long equipmentId) {
        this.equipmentId = equipmentId;
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
}
