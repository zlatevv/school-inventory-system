package bg.schoolinventory.requestservice.controller;

import bg.schoolinventory.requestservice.dto.RequestCreateDTO;
import bg.schoolinventory.requestservice.dto.RequestResponseDTO;
import bg.schoolinventory.requestservice.model.Request;
import bg.schoolinventory.requestservice.service.RequestService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(RequestController.class)
class RequestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private RequestService requestService;

    @Test
    void createRequest_ShouldReturn200AndCreatedRequest() throws Exception {
        RequestCreateDTO createDTO = new RequestCreateDTO();
        createDTO.setEquipmentId(1L);
        createDTO.setBorrowStartTime(java.time.LocalDateTime.now().plusDays(1));
        createDTO.setBorrowEndTime(java.time.LocalDateTime.now().plusDays(2));

        Request mockRequest = new Request();
        mockRequest.setId(10L);

        when(requestService.createRequest(any(RequestCreateDTO.class), eq("Tsvetan")))
                .thenReturn(mockRequest);

        mockMvc.perform(post("/api/request")
                        .with(jwt().jwt(jwt -> jwt.subject("Tsvetan")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10L));
    }

    @Test
    void getMyRequests_ShouldReturn200AndListOfRequests() throws Exception {
        RequestResponseDTO responseDTO = new RequestResponseDTO();


        when(requestService.getMyRequests("Tsvetan"))
                .thenReturn(List.of(responseDTO));

        // 2. Изпълнение и проверка
        mockMvc.perform(get("/api/requests")
                        .with(jwt().jwt(jwt -> jwt.subject("Tsvetan"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void approveRequest_ShouldReturn200AndApprovedRequest() throws Exception {
        // 1. Подготовка
        Long requestId = 1L;
        Request mockRequest = new Request();
        // mockRequest.setStatus(RequestStatus.APPROVED);

        when(requestService.approveRequest(requestId)).thenReturn(mockRequest);

        mockMvc.perform(put("/api/request/{id}/approve", requestId)
                        .with(jwt()))
                .andExpect(status().isOk());
    }

    @Test
    void returnEquipment_ShouldReturn200_WithCustomCondition() throws Exception {
        Long requestId = 1L;
        String condition = "Счупен екран";
        Request mockRequest = new Request();

        when(requestService.returnEquipment(requestId, condition)).thenReturn(mockRequest);

        mockMvc.perform(put("/api/request/{id}/return", requestId)
                        .param("condition", condition)
                        .with(jwt()))
                .andExpect(status().isOk());
    }

    @Test
    void createRequest_WithInvalidData_ShouldReturn400BadRequest() throws Exception {
        RequestCreateDTO invalidDto = new RequestCreateDTO();

        mockMvc.perform(post("/api/request")
                        .with(jwt().jwt(jwt -> jwt.subject("Tsvetan")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidDto)))
                .andExpect(status().isBadRequest());
    }
}