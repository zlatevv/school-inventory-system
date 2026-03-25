package bg.schoolinventory.requestservice.repository;

import bg.schoolinventory.requestservice.enums.RequestStatus;
import bg.schoolinventory.requestservice.model.Request;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RequestRepository extends JpaRepository<Request, Long> {
    List<Request> findAllByUsernameRequesting(String usernameRequesting);
    List<Request> findByStatusAndBorrowEndTimeBetween(RequestStatus status, LocalDateTime start, LocalDateTime end);
}
