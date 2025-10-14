package com.hirepicker.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(HealthController.class) // HealthController만 테스트하도록 지정
class HealthControllerTest {

    @Autowired
    private MockMvc mockMvc; // MockMvc는 실제 서버를 띄우지 않고 API를 테스트할 수 있게 해주는 가짜 객체

    @Test
    void 헬스_체크_API는_정상적으로_동작한다() throws Exception {
        // given: 준비 단계 (딱히 없음)

        // when & then: 실행 및 검증 단계
        mockMvc.perform(get("/api/health")) // /api/health 경로로 GET 요청을 보냈을 때
                .andExpect(status().isOk()) // HTTP 상태 코드가 200 (isOk())인지 확인하고
                .andExpect(content().string("Server is healthy!")); // 응답 본문이 "Server is healthy!"와 일치하는지 확인한다.
    }
}