package com.hirepicker.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.hirepicker.entity.Company;
import com.hirepicker.entity.Companyalarms;
import com.hirepicker.entity.PersonalUser;
import com.hirepicker.repository.CompanyRepository;
import com.hirepicker.repository.CompanyalarmsRepository;
import com.hirepicker.repository.PersonalUserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CompanyalarmsService {
    private final CompanyalarmsRepository companyalarmsRepository;
    private final PersonalUserRepository personalUserRepository;
    private final CompanyRepository companyRepository;

    @Transactional
    public Companyalarms addCompanyAlarm(Long pUserIdx, Long companyIdx) {
        PersonalUser personalUser = personalUserRepository.findById(pUserIdx)
                .orElseThrow(() -> new IllegalArgumentException("Invalid personal user ID"));
        Company company = companyRepository.findById(companyIdx)
                .orElseThrow(() -> new IllegalArgumentException("Invalid company ID"));

        // Check if alarm already exists
        if (companyalarmsRepository.findBypUserIdx_IdAndCompanyIdx_CompanyIdx(personalUser.getId(),
                company.getCompanyIdx()).isPresent()) {
            throw new IllegalArgumentException("Company alarm already exists for this user and company");
        }

        Companyalarms companyalarms = Companyalarms.builder()
                .pUserIdx(personalUser)
                .companyIdx(company)
                .build();
        return companyalarmsRepository.save(companyalarms);
    }

    @Transactional
    public void removeCompanyAlarm(Long pUserIdx, Long companyIdx) {
        companyalarmsRepository.deleteBypUserIdx_IdAndCompanyIdx_CompanyIdx(pUserIdx, companyIdx);
    }

    public List<Long> getLikedCompanyIdsByPersonalUser(Long pUserIdx) {
        return companyalarmsRepository.findBypUserIdx_Id(pUserIdx).stream()
                .map(companyalarms -> companyalarms.getCompanyIdx().getCompanyIdx())
                .collect(Collectors.toList());
    }

    public boolean isCompanyLikedByUser(Long pUserIdx, Long companyIdx) {
        return companyalarmsRepository.findBypUserIdx_IdAndCompanyIdx_CompanyIdx(pUserIdx, companyIdx).isPresent();
    }
}
