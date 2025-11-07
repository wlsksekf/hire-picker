package com.hirepicker.service;

import com.google.genai.types.Content;
import com.google.genai.types.FunctionDeclaration;
import com.google.genai.types.FunctionResponse;
import com.google.genai.types.Part;
import com.google.genai.types.Schema;
import com.google.genai.types.Tool;
import com.google.genai.types.Type;
import com.hirepicker.entity.Company;
import com.hirepicker.entity.JobPosting;
import com.hirepicker.repository.CompanyRepository;
import com.hirepicker.repository.JobPostingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatbotToolService {

    private final JobPostingRepository jobPostingRepository;
    private final CompanyRepository companyRepository; // CompanyRepository 주입

    // 채용 공고 검색
    public List<Map<String, String>> searchJobPostings(String keyword, String location) {
        List<JobPosting> postings;
        if (location == null || location.isEmpty() || "모든 지역".equalsIgnoreCase(location)) {
            postings = jobPostingRepository.findByTitleContaining(keyword);
        } else {
            postings = jobPostingRepository.findByTitleContainingAndLocation(keyword, location);
        }

        return postings.stream()
                .limit(5)
                .map(p -> Map.of(
                        "title", p.getTitle(),
                        "companyName", p.getCompany().getCompanyName(),
                        "location", p.getLocation()
                ))
                .collect(Collectors.toList());
    }

    // 기업 정보 검색
    public List<Map<String, String>> searchCompanyInfo(String companyName) {
        List<Company> companies = 
                companyRepository.findByCompanyNameContainingIgnoreCase(companyName, PageRequest.of(0, 5)).getContent();

        return companies.stream()
                .map(c -> Map.of(
                        "companyName", c.getCompanyName() != null ? c.getCompanyName() : "",
                        "description", c.getDescription() != null ? c.getDescription() : "",
                        "websiteUrl", c.getWebsiteUrl() != null ? c.getWebsiteUrl() : "",
                        "ceoName", c.getCeoName() != null ? c.getCeoName() : "",
                        "address", c.getAddress() != null ? c.getAddress() : "",
                        "employeeCount", c.getEmployeeCount() != null ? c.getEmployeeCount() : "",
                        "salesAmount", c.getSalesAmount() != null ? c.getSalesAmount().toString() : "",
                        "welfareBenefits", c.getWelfareBenefits() != null ? c.getWelfareBenefits() : ""
                ))
                .collect(Collectors.toList());
    }

    // 채용 공고 검색 함수 선언
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

    // 기업 정보 검색 함수 선언
    public Tool getSearchCompanyInfoTool() {
        Schema paramSchema = Schema.builder()
                .type(new Type(Type.Known.OBJECT))
                .properties(Map.of(
                        "companyName", Schema.builder()
                                .type(new Type(Type.Known.STRING))
                                .description("검색할 기업 이름. 예: '네이버', '카카오'")
                                .build()
                ))
                .required(List.of("companyName"))
                .build();

        FunctionDeclaration searchFn = FunctionDeclaration.builder()
                .name("searchCompanyInfo")
                .description("Hire-Picker DB에서 기업 이름으로 기업 정보를 검색합니다.")
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