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

@Service
@RequiredArgsConstructor
@Transactional
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final PersonalUserRepository personalUserRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");

        Optional<PersonalUser> userOptional = personalUserRepository.findByEmail(email);

        PersonalUser personalUser;
        if (userOptional.isPresent()) {
            // 이미 가입된 유저라면, 기존 정보를 그대로 사용 (필요 시 정보 업데이트 로직 추가 가능)
            personalUser = userOptional.get();
        } else {
            // 신규 유저라면, DB에 저장 (비밀번호는 null)
            personalUser = PersonalUser.builder()
                    .email(email)
                    .name(name)
                    .nickname(email) // 닉네임은 일단 이메일로 설정 (나중에 변경 기능 제공)
                    .platform(Platform.GOOGLE)
                    // TODO: 성별 정보는 구글 스코프에 따라 추가 처리가 필요할 수 있음 (현재는 임시값)
                    .gender(com.hirepicker.entity.Gender.MALE) 
                    .build();
            personalUserRepository.save(personalUser);
        }

        return new CustomUserDetails(personalUser, oAuth2User.getAttributes());
    }
}
