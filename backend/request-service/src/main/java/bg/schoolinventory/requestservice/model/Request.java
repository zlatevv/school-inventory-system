package bg.schoolinventory.requestservice.model;

import bg.schoolinventory.inventoryservice.enums.RequestStatus;
import bg.schoolinventory.inventoryservice.model.Equipment;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "requests")
public class Request {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String usernameRequesting;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    @Column(nullable = false)
    private LocalDateTime requestDate;

    @Column(nullable = false)
    private LocalDateTime borrowStartTime;

    @Column(nullable = false)
    private LocalDateTime borrowEndTime;

    @Enumerated(EnumType.STRING)
    private RequestStatus status;

    public Request() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsernameRequesting() {
        return usernameRequesting;
    }

    public void setUsernameRequesting(String usernameRequesting) {
        this.usernameRequesting = usernameRequesting;
    }

    public Equipment getEquipment() {
        return equipment;
    }

    public void setEquipment(Equipment equipment) {
        this.equipment = equipment;
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

    public RequestStatus getStatus() {
        return status;
    }

    public void setStatus(RequestStatus status) {
        this.status = status;
    }
}
