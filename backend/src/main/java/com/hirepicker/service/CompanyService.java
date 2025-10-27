package com.hirepicker.service;

import com.hirepicker.dto.CompanySearchResponseDto;
import com.hirepicker.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CompanyService {

    private final CompanyRepository companyRepository;

    public List<CompanySearchResponseDto> searchByName(String name) {
        // 자동완성을 위해 상위 10개 결과만 가져옴
        Pageable pageable = PageRequest.of(0, 10);
        return companyRepository.findByCompanyNameContainingIgnoreCase(name, pageable)
                .getContent()
                .stream()
                .map(CompanySearchResponseDto::fromEntity)
                .collect(Collectors.toList());
    }
}
