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

@Service // Spring의 서비스 빈으로 등록
@RequiredArgsConstructor // final 필드에 대한 생성자 자동 생성
@Transactional // 트랜잭션 관리 활성화
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final PersonalUserRepository personalUserRepository; // 사용자 리포지토리

    private record UserInfo(String email, String name, com.hirepicker.entity.Gender gender) {}

    // OAuth2 사용자 정보를 로드하는 메서드
    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        Platform platform = Platform.fromRegistrationId(registrationId);

        Map<String, Object> attributes = oAuth2User.getAttributes();
        UserInfo userInfo = switch (platform) {
            case GOOGLE -> {
                String email = (String) attributes.get("email");
                String name = (String) attributes.get("name");
                yield new UserInfo(email, name, null);
            }
            case NAVER -> {
                Map<String, Object> response = (Map<String, Object>) attributes.get("response");
                String email = (String) response.get("email");
                String name = (String) response.get("name");
                String genderStr = (String) response.get("gender");
                com.hirepicker.entity.Gender gender = null;
                if ("M".equalsIgnoreCase(genderStr)) {
                    gender = com.hirepicker.entity.Gender.MALE;
                } else if ("F".equalsIgnoreCase(genderStr)) {
                    gender = com.hirepicker.entity.Gender.FEMALE;
                }
                yield new UserInfo(email, name, gender);
            }
            case KAKAO -> {
                Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
                String email = (String) kakaoAccount.get("email");
                Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");
                String name = (String) profile.get("nickname");
                String genderStr = (String) kakaoAccount.get("gender");
                com.hirepicker.entity.Gender gender = null;
                if ("male".equalsIgnoreCase(genderStr)) {
                    gender = com.hirepicker.entity.Gender.MALE;
                } else if ("female".equalsIgnoreCase(genderStr)) {
                    gender = com.hirepicker.entity.Gender.FEMALE;
                }
                yield new UserInfo(email, name, gender);
            }
            default -> throw new OAuth2AuthenticationException("Unsupported platform: " + registrationId);
        };

        PersonalUser personalUser = personalUserRepository.findByEmail(userInfo.email())
                .map(user -> {
                    // 이미 가입된 유저라면, 플랫폼 정보 업데이트
                    if (user.getPlatform() == null || !user.getPlatform().equals(platform.name())) {
                        user.setPlatform(platform.name());
                        return personalUserRepository.save(user);
                    }
                    return user;
                })
                .orElseGet(() -> {
                    // 신규 유저라면, DB에 저장
                    PersonalUser newUser = PersonalUser.builder()
                            .email(userInfo.email())
                            .name(userInfo.name())
                            .nickname(userInfo.email())
                            .platform(platform.name())
                            .gender(userInfo.gender())
                            .build();
                    return personalUserRepository.save(newUser);
                });

        return new CustomUserDetails(personalUser, oAuth2User.getAttributes());
    }
}