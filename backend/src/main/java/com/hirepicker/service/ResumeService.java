package com.hirepicker.service;

import com.hirepicker.dto.ResumeDto;
import com.hirepicker.dto.ResumeResponseDto;
import com.hirepicker.entity.PersonalUser;
import com.hirepicker.entity.Resume;
import com.hirepicker.repository.PersonalUserRepository;
import com.hirepicker.repository.ResumeRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

// 이력서 관련 비즈니스 로직을 처리하는 서비스
@Service
@RequiredArgsConstructor
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final PersonalUserRepository personalUserRepository;

    // 이력서 저장 또는 업데이트
    @Transactional
    public ResumeResponseDto saveResume(ResumeDto resumeDto) {
        // 1. DTO에서 사용자 ID를 가져와 해당 사용자가 DB에 존재하는지 확인
        PersonalUser personalUser = personalUserRepository.findById(resumeDto.getPUserIdx())
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자를 찾을 수 없습니다. id=" + resumeDto.getPUserIdx()));

        // 2. DTO를 엔티티로 변환
        Resume resume = resumeDto.toEntity(personalUser);

        // 3. 리포지토리를 통해 엔티티를 DB에 저장
        Resume savedResume = resumeRepository.save(resume);

        // 4. 저장된 엔티티를 기반으로 응답 DTO 생성하여 반환
        return new ResumeResponseDto(savedResume);
    }
}
