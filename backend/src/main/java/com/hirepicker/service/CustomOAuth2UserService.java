package com.hirepicker.service;

import com.hirepicker.config.security.CustomUserDetails;
import com.hirepicker.entity.PersonalUser;
import com.hirepicker.entity.Platform;
import com.hirepicker.repository.PersonalUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;

@Service // Spring의 서비스 빈으로 등록
@RequiredArgsConstructor // final 필드에 대한 생성자 자동 생성
@Transactional // 트랜잭션 관리 활성화
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final PersonalUserRepository personalUserRepository; // 사용자 리포지토리

    // OAuth2 사용자 정보를 로드하는 메서드
    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest); // 기본 OAuth2 사용자 정보 로드
        Map<String, Object> attributes = oAuth2User.getAttributes(); // 속성 정보 추출

        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");

        Optional<PersonalUser> userOptional = personalUserRepository.findByEmail(email);

        PersonalUser personalUser;
        if (userOptional.isPresent()) {
            // 이미 가입된 유저라면, 기존 정보를 그대로 사용
            personalUser = userOptional.get();
        } else {
            // 신규 유저라면, DB에 저장
            personalUser = PersonalUser.builder()
                    .email(email)
                    .name(name)
                    .nickname(email) // 닉네임은 일단 이메일로 설정
                    .platform(Platform.GOOGLE) // 플랫폼은 구글로 설정
                    // TODO: 성별 정보는 구글 스코프에 따라 추가 처리가 필요
                    .gender(com.hirepicker.entity.Gender.MALE) 
                    .build();
            personalUserRepository.save(personalUser);
        }

        return new CustomUserDetails(personalUser, oAuth2User.getAttributes()); // CustomUserDetails 객체 반환
    }
}