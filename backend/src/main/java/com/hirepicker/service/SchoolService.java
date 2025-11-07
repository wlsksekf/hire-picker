package com.hirepicker.service;

import com.hirepicker.dto.SchoolDto;
import com.hirepicker.entity.School;
import com.hirepicker.repository.SchoolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SchoolService {

    private final SchoolRepository schoolRepository;

    public List<SchoolDto> searchSchoolsByName(String schoolName) {
        List<School> schools = schoolRepository.findBySchoolNameContaining(schoolName);
        return schools.stream()
                .map(school -> new SchoolDto(school.getSchoolCode(), school.getSchoolName()))
                .collect(Collectors.toList());
    }
}
