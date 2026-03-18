package bg.schoolinventory.reportservice.service;

import bg.schoolinventory.reportservice.dto.HistoryReportDTO;
import bg.schoolinventory.reportservice.dto.UsageReportDTO;

import java.util.List;

public interface ReportService {
    List<UsageReportDTO> getUsageReport();
    List<HistoryReportDTO> getHistoryReport();
    byte[] exportUsageReportCsv();
    byte[] exportUsageReportPdf();
    byte[] exportHistoryReportCsv();
    byte[] exportHistoryReportPdf();
}