package bg.schoolinventory.reportservice.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class ReportRepository {

    @PersistenceContext
    private EntityManager entityManager;

    public List<Object[]> getUsageReportData() {
        return entityManager.createNativeQuery("""
                SELECT
                    e.name AS equipmentName,
                    e.type AS equipmentType,
                    COUNT(r.id) AS totalRequests,
                    SUM(CASE WHEN r.status = 'APPROVED' THEN 1 ELSE 0 END) AS approvedRequests,
                    SUM(CASE WHEN r.status = 'RETURNED' THEN 1 ELSE 0 END) AS returnedRequests,
                    AVG(TIMESTAMPDIFF(HOUR, r.borrow_start_time, r.borrow_end_time)) AS averageBorrowDuration,
                    MAX(r.request_date) AS lastUsed
                FROM equipment e
                LEFT JOIN requests r ON e.id = r.equipment_id
                GROUP BY e.id, e.name, e.type
                ORDER BY totalRequests DESC
                """)
                .getResultList();
    }

    public List<Object[]> getHistoryReportData() {
        return entityManager.createNativeQuery("""
                SELECT
                    r.username_requesting AS username,
                    e.name AS equipmentName,
                    r.request_date AS requestDate,
                    r.borrow_start_time AS borrowStartTime,
                    r.borrow_end_time AS borrowEndTime,
                    r.status AS status,
                    CASE WHEN r.status = 'RETURNED' THEN r.request_date ELSE NULL END AS returnDate,
                    r.return_condition AS returnCondition
                FROM requests r
                LEFT JOIN equipment e ON r.equipment_id = e.id
                ORDER BY r.request_date DESC
                """)
                .getResultList();
    }
}
