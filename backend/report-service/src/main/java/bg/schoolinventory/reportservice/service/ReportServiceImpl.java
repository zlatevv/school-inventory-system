package bg.schoolinventory.reportservice.service;

import bg.schoolinventory.reportservice.dto.HistoryReportDTO;
import bg.schoolinventory.reportservice.dto.UsageReportDTO;
import bg.schoolinventory.reportservice.repository.ReportRepository;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.opencsv.CSVWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.StringWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class ReportServiceImpl implements ReportService {

    private final ReportRepository reportRepository;

    public ReportServiceImpl(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    @Override
    public List<UsageReportDTO> getUsageReport() {
        List<Object[]> results = reportRepository.getUsageReportData();
        List<UsageReportDTO> reports = new ArrayList<>();

        for (Object[] row : results) {
            UsageReportDTO dto = new UsageReportDTO();
            dto.setEquipmentName((String) row[0]);
            dto.setEquipmentType((String) row[1]);
            dto.setTotalRequests(row[2] != null ? ((Number) row[2]).longValue() : 0L);
            dto.setApprovedRequests(row[3] != null ? ((Number) row[3]).longValue() : 0L);
            dto.setReturnedRequests(row[4] != null ? ((Number) row[4]).longValue() : 0L);
            dto.setAverageBorrowDuration(row[5] != null ? ((Number) row[5]).doubleValue() : 0.0);
            dto.setLastUsed(row[6] != null ? (LocalDateTime) row[6] : null);
            reports.add(dto);
        }

        return reports;
    }

    @Override
    public List<HistoryReportDTO> getHistoryReport() {
        List<Object[]> results = reportRepository.getHistoryReportData();
        List<HistoryReportDTO> reports = new ArrayList<>();

        for (Object[] row : results) {
            HistoryReportDTO dto = new HistoryReportDTO();
            dto.setUsername((String) row[0]);
            dto.setEquipmentName((String) row[1]);
            dto.setRequestDate((LocalDateTime) row[2]);
            dto.setBorrowStartTime((LocalDateTime) row[3]);
            dto.setBorrowEndTime((LocalDateTime) row[4]);
            dto.setStatus((String) row[5]);
            dto.setReturnDate((LocalDateTime) row[6]);
            dto.setReturnCondition((String) row[7]);
            reports.add(dto);
        }

        return reports;
    }

    @Override
    public byte[] exportUsageReportCsv() {
        List<UsageReportDTO> reports = getUsageReport();

        StringWriter writer = new StringWriter();
        CSVWriter csvWriter = new CSVWriter(writer);

        // Header
        csvWriter.writeNext(new String[]{
            "Equipment Name", "Type", "Total Requests", "Approved Requests",
            "Returned Requests", "Avg Borrow Duration (hours)", "Last Used"
        });

        // Data
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        for (UsageReportDTO report : reports) {
            csvWriter.writeNext(new String[]{
                report.getEquipmentName(),
                report.getEquipmentType(),
                String.valueOf(report.getTotalRequests()),
                String.valueOf(report.getApprovedRequests()),
                String.valueOf(report.getReturnedRequests()),
                String.format("%.2f", report.getAverageBorrowDuration()),
                report.getLastUsed() != null ? report.getLastUsed().format(formatter) : ""
            });
        }

        return writer.toString().getBytes();
    }

    @Override
    public byte[] exportUsageReportPdf() {
        List<UsageReportDTO> reports = getUsageReport();

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(outputStream);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document document = new Document(pdfDoc);

        document.add(new Paragraph("Equipment Usage Report"));
        document.add(new Paragraph("Generated on: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))));
        document.add(new Paragraph("\n"));

        Table table = new Table(7);
        table.addHeaderCell("Equipment Name");
        table.addHeaderCell("Type");
        table.addHeaderCell("Total Requests");
        table.addHeaderCell("Approved");
        table.addHeaderCell("Returned");
        table.addHeaderCell("Avg Duration (h)");
        table.addHeaderCell("Last Used");

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        for (UsageReportDTO report : reports) {
            table.addCell(report.getEquipmentName());
            table.addCell(report.getEquipmentType());
            table.addCell(String.valueOf(report.getTotalRequests()));
            table.addCell(String.valueOf(report.getApprovedRequests()));
            table.addCell(String.valueOf(report.getReturnedRequests()));
            table.addCell(String.format("%.2f", report.getAverageBorrowDuration()));
            table.addCell(report.getLastUsed() != null ? report.getLastUsed().format(formatter) : "");
        }

        document.add(table);
        document.close();

        return outputStream.toByteArray();
    }

    @Override
    public byte[] exportHistoryReportCsv() {
        List<HistoryReportDTO> reports = getHistoryReport();

        StringWriter writer = new StringWriter();
        CSVWriter csvWriter = new CSVWriter(writer);

        // Header
        csvWriter.writeNext(new String[]{
            "Username", "Equipment Name", "Request Date", "Borrow Start", "Borrow End",
            "Status", "Return Date", "Return Condition"
        });

        // Data
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        for (HistoryReportDTO report : reports) {
            csvWriter.writeNext(new String[]{
                report.getUsername(),
                report.getEquipmentName(),
                report.getRequestDate().format(formatter),
                report.getBorrowStartTime().format(formatter),
                report.getBorrowEndTime().format(formatter),
                report.getStatus(),
                report.getReturnDate() != null ? report.getReturnDate().format(formatter) : "",
                report.getReturnCondition() != null ? report.getReturnCondition() : ""
            });
        }

        return writer.toString().getBytes();
    }

    @Override
    public byte[] exportHistoryReportPdf() {
        List<HistoryReportDTO> reports = getHistoryReport();

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(outputStream);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document document = new Document(pdfDoc);

        document.add(new Paragraph("Borrowing History Report"));
        document.add(new Paragraph("Generated on: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))));
        document.add(new Paragraph("\n"));

        Table table = new Table(8);
        table.addHeaderCell("Username");
        table.addHeaderCell("Equipment");
        table.addHeaderCell("Request Date");
        table.addHeaderCell("Borrow Start");
        table.addHeaderCell("Borrow End");
        table.addHeaderCell("Status");
        table.addHeaderCell("Return Date");
        table.addHeaderCell("Condition");

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        for (HistoryReportDTO report : reports) {
            table.addCell(report.getUsername());
            table.addCell(report.getEquipmentName());
            table.addCell(report.getRequestDate().format(formatter));
            table.addCell(report.getBorrowStartTime().format(formatter));
            table.addCell(report.getBorrowEndTime().format(formatter));
            table.addCell(report.getStatus());
            table.addCell(report.getReturnDate() != null ? report.getReturnDate().format(formatter) : "");
            table.addCell(report.getReturnCondition() != null ? report.getReturnCondition() : "");
        }

        document.add(table);
        document.close();

        return outputStream.toByteArray();
    }
}