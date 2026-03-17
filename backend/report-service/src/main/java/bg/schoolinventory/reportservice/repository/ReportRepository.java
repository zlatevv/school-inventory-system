package bg.schoolinventory.reportservice.repository;

import bg.schoolinventory.reportservice.dto.UsageReportDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Object, Long> {

    @Query(value = """
        SELECT
            e.name as equipmentName,
            e.type as equipmentType,
            COUNT(r.id) as totalRequests,
            SUM(CASE WHEN r.status = 'APPROVED' THEN 1 ELSE 0 END) as approvedRequests,
            SUM(CASE WHEN r.status = 'RETURNED' THEN 1 ELSE 0 END) as returnedRequests,
            AVG(TIMESTAMPDIFF(HOUR, r.borrow_start_time, r.borrow_end_time)) as averageBorrowDuration,
            MAX(r.request_date) as lastUsed
        FROM equipment e
        LEFT JOIN requests r ON e.id = r.equipment_id
        GROUP BY e.id, e.name, e.type
        ORDER BY totalRequests DESC
        """, nativeQuery = true)
    List<Object[]> getUsageReportData();

    @Query(value = """
        SELECT
            r.username_requesting as username,
            e.name as equipmentName,
            r.request_date as requestDate,
            r.borrow_start_time as borrowStartTime,
            r.borrow_end_time as borrowEndTime,
            r.status as status,
            CASE WHEN r.status = 'RETURNED' THEN r.request_date ELSE NULL END as returnDate,
            r.return_condition as returnCondition
        FROM requests r
        LEFT JOIN equipment e ON r.equipment_id = e.id
        ORDER BY r.request_date DESC
        """, nativeQuery = true)
    List<Object[]> getHistoryReportData();
}