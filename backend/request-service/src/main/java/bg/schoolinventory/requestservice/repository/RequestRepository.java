package bg.schoolinventory.requestservice.repository;

import bg.schoolinventory.requestservice.model.Request;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RequestRepository extends JpaRepository<Request, Long> {
    List<Request> findAllByUsernameRequesting(String usernameRequesting);
}
