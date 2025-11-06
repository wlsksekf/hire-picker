package com.hirepicker.service;

import com.hirepicker.entity.Company;
import com.hirepicker.entity.Companyalarms;
import com.hirepicker.entity.PersonalUser;
import com.hirepicker.repository.CompanyalarmsRepository;
import com.hirepicker.repository.CompanyRepository;
import com.hirepicker.repository.PersonalUserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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
        if (companyalarmsRepository.findByPersonalUser_IdAndCompany_CompanyIdx(pUserIdx, companyIdx).isPresent()) {
            throw new IllegalArgumentException("Company alarm already exists for this user and company");
        }

        Companyalarms companyalarms = Companyalarms.builder()
                .personalUser(personalUser)
                .company(company)
                .build();
        return companyalarmsRepository.save(companyalarms);
    }

    @Transactional
    public void removeCompanyAlarm(Long pUserIdx, Long companyIdx) {
        companyalarmsRepository.deleteByPersonalUser_IdAndCompany_CompanyIdx(pUserIdx, companyIdx);
    }

    public List<Long> getLikedCompanyIdsByPersonalUser(Long pUserIdx) {
        return companyalarmsRepository.findByPersonalUser_Id(pUserIdx).stream()
                .map(companyalarms -> companyalarms.getCompany().getCompanyIdx())
                .collect(Collectors.toList());
    }

    public boolean isCompanyLikedByUser(Long pUserIdx, Long companyIdx) {
        return companyalarmsRepository.findByPersonalUser_IdAndCompany_CompanyIdx(pUserIdx, companyIdx).isPresent();
    }
}
