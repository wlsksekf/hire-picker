package com.hirepicker.service;

import com.hirepicker.dto.SchoolDto;
import com.hirepicker.entity.School;
import com.hirepicker.repository.SchoolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SchoolService {

    private final SchoolRepository schoolRepository;

    public List<SchoolDto> searchSchoolsByName(String schoolName) {
        // 학교명 일부 일치를 통한 검색(캠퍼스 포함 정보 반환)
        List<School> schools = schoolRepository.findBySchoolNameContaining(schoolName);
        return schools.stream()
                .map(school -> new SchoolDto(school.getSchoolCode(), school.getSchoolName(), school.getCampus()))
                .collect(Collectors.toList());
    }

    // 정확히 일치하는 학교 찾기 (학교명으로)
    public Optional<SchoolDto> findExactSchoolByName(String schoolName) {
        String normalized = schoolName != null ? schoolName.trim() : "";

        // 1차: 정확히 일치하는 학교 바로 조회
        Optional<School> exactMatch = schoolRepository.findFirstBySchoolNameIgnoreCase(normalized);
        if (exactMatch.isPresent()) {
            School school = exactMatch.get();
            return Optional.of(new SchoolDto(
                    school.getSchoolCode(),
                    school.getSchoolName(),
                    school.getCampus()
            ));
        }

        // 2차: 부분 일치 결과 중 공백 제거 후 동일한 이름 매칭
        List<School> schools = schoolRepository.findBySchoolNameContaining(normalized);
        Optional<School> fallback = schools.stream()
                .filter(s -> normalize(s.getSchoolName()).equals(normalize(normalized)))
                .findFirst();

        return fallback.map(school -> new SchoolDto(
                school.getSchoolCode(),
                school.getSchoolName(),
                school.getCampus()
        ));
    }

    private String normalize(String value) {
        return value == null ? "" : value.replaceAll("\\s+", "").toLowerCase();
    }
}
