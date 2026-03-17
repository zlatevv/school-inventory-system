package bg.schoolinventory.reportservice.controller;

import bg.schoolinventory.reportservice.dto.HistoryReportDTO;
import bg.schoolinventory.reportservice.dto.UsageReportDTO;
import bg.schoolinventory.reportservice.service.ReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/reports/usage")
    public ResponseEntity<List<UsageReportDTO>> getUsageReport() {
        List<UsageReportDTO> report = reportService.getUsageReport();
        return ResponseEntity.ok(report);
    }

    @GetMapping("/reports/history")
    public ResponseEntity<List<HistoryReportDTO>> getHistoryReport() {
        List<HistoryReportDTO> report = reportService.getHistoryReport();
        return ResponseEntity.ok(report);
    }

    @GetMapping("/reports/export")
    public ResponseEntity<byte[]> exportReport(
            @RequestParam String type, // "usage" or "history"
            @RequestParam String format // "csv" or "pdf"
    ) {
        byte[] data;
        String filename;
        MediaType mediaType;

        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));

        if ("usage".equals(type)) {
            if ("csv".equals(format)) {
                data = reportService.exportUsageReportCsv();
                filename = "usage_report_" + timestamp + ".csv";
                mediaType = MediaType.TEXT_PLAIN;
            } else if ("pdf".equals(format)) {
                data = reportService.exportUsageReportPdf();
                filename = "usage_report_" + timestamp + ".pdf";
                mediaType = MediaType.APPLICATION_PDF;
            } else {
                return ResponseEntity.badRequest().build();
            }
        } else if ("history".equals(type)) {
            if ("csv".equals(format)) {
                data = reportService.exportHistoryReportCsv();
                filename = "history_report_" + timestamp + ".csv";
                mediaType = MediaType.TEXT_PLAIN;
            } else if ("pdf".equals(format)) {
                data = reportService.exportHistoryReportPdf();
                filename = "history_report_" + timestamp + ".pdf";
                mediaType = MediaType.APPLICATION_PDF;
            } else {
                return ResponseEntity.badRequest().build();
            }
        } else {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(data);
    }
}