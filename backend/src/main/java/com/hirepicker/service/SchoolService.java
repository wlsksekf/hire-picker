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
        // 정확히 일치하는 학교 찾기 (campus는 null 허용)
        List<School> schools = schoolRepository.findBySchoolNameContaining(schoolName);
        // 동일 이름 다수 존재 시 완전 일치 항목만 추출
        Optional<School> exactMatch = schools.stream()
                .filter(s -> s.getSchoolName().equals(schoolName))
                .findFirst();
        
        return exactMatch.map(school -> new SchoolDto(
                school.getSchoolCode(), 
                school.getSchoolName(), 
                school.getCampus()
        ));
    }
}
