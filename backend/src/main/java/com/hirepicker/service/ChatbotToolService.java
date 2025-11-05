package com.hirepicker.service;

import com.google.genai.types.Content;
import com.google.genai.types.FunctionDeclaration;
import com.google.genai.types.FunctionResponse;
import com.google.genai.types.Part;
import com.google.genai.types.Schema;
import com.google.genai.types.Tool;
import com.google.genai.types.Type;
import com.hirepicker.entity.JobPosting;
import com.hirepicker.repository.JobPostingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatbotToolService {

    private final JobPostingRepository jobPostingRepository;

    public List<Map<String, String>> searchJobPostings(String keyword, String location) {
        List<JobPosting> postings =
                jobPostingRepository.findByTitleContainingAndLocation(keyword, location);

        return postings.stream()
                .limit(5)
                .map(p -> Map.of(
                        "title", p.getTitle(),
                        "companyName", p.getCompany().getCompanyName(),
                        "location", p.getLocation()
                ))
                .collect(Collectors.toList());
    }

    // 함수 선언 (툴 스키마)
    public Tool getSearchJobPostingsTool() {
        Schema paramSchema = Schema.builder()
                .type(new Type(Type.Known.OBJECT))
                .properties(Map.of(
                        "keyword", Schema.builder()
                                .type(new Type(Type.Known.STRING))
                                .description("검색 키워드. 예: '스프링 부트', 'React'")
                                .build(),
                        "location", Schema.builder()
                                .type(new Type(Type.Known.STRING))
                                .description("지역. 예: '서울', '부산'")
                                .build()
                ))
                .required(List.of("keyword", "location"))
                .build();

        FunctionDeclaration searchFn = FunctionDeclaration.builder()
                .name("searchJobPostings")
                .description("Hire-Picker DB에서 키워드와 지역으로 채용 공고를 검색합니다.")
                .parameters(paramSchema)
                .build();

        return Tool.builder()
                .functionDeclarations(List.of(searchFn))
                .build();
    }

    // 함수 실행 결과를 모델로 다시 전달할 Content로 변환
    public Content createFunctionResponse(String functionName, List<Map<String, String>> dbResults) {
        FunctionResponse fr = FunctionResponse.builder()
                .name(functionName)
                .response(Map.of("results", dbResults))
                .build();

        Part part = Part.builder().functionResponse(fr).build();

        return Content.builder()
                .role("user") // 일반적으로 user로 보냄
                .parts(List.of(part))
                .build();
    }
}