package bg.schoolinventory.requestservice.repository;

import bg.schoolinventory.inventoryservice.model.Request;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RequestRepository extends JpaRepository<Request, Long> {
}
