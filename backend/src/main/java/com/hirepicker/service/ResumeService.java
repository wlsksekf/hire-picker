package com.hirepicker.service;

import com.hirepicker.dto.ResumeDto;
import com.hirepicker.dto.ResumeResponseDto;
import com.hirepicker.entity.PersonalUser;
import com.hirepicker.entity.Resume;
import com.hirepicker.repository.PersonalUserRepository;
import com.hirepicker.repository.ResumeRepository;
import com.hirepicker.repository.WorkExperienceRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

// 이력서 관련 비즈니스 로직을 처리하는 서비스
@Service
@RequiredArgsConstructor
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final PersonalUserRepository personalUserRepository;
    private final WorkExperienceRepository workExperienceRepository; // 경력 조회 리포지토리
    private final S3UploadService s3UploadService; // S3 업로드 서비스

    // 이력서 저장 또는 업데이트
    @Transactional
    public ResumeResponseDto saveResume(ResumeDto resumeDto, MultipartFile imageFile) throws IOException {
        // 1. DTO에서 사용자 ID를 가져와 해당 사용자가 DB에 존재하는지 확인
        PersonalUser personalUser = personalUserRepository.findById(resumeDto.getPUserIdx())
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자를 찾을 수 없습니다. id=" + resumeDto.getPUserIdx()));

        // 2. 이미지 파일이 있으면 S3에 업로드하고 URL을 가져옴
        String imageUrl = null;
        if (imageFile != null && !imageFile.isEmpty()) {
            imageUrl = s3UploadService.uploadFile(imageFile, "resume-images");
        }

        // 3. DTO를 엔티티로 변환 (이때 이미지 URL도 함께 전달)
        // 3. DTO를 엔티티로 변환(이미지 URL 포함)
        Resume resume = resumeDto.toEntity(personalUser, imageUrl);
        // 3-1. exp_idx가 있으면 경력 연동(존재 시에만)
        if (resumeDto.getExpIdx() != null) {
            workExperienceRepository.findById(resumeDto.getExpIdx())
                    .ifPresent(resume::attachWorkExperience);
        }

        // 4. 리포지토리를 통해 엔티티를 DB에 저장
        Resume savedResume = resumeRepository.save(resume);

        // 5. 저장된 엔티티를 기반으로 응답 DTO 생성하여 반환
        return new ResumeResponseDto(savedResume);
    }
}
