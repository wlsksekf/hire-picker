package com.hirepicker.dto;
import com.hirepicker.entity.UserType;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 사용자 정보 DTO (Data Transfer Object)
 *
 * 역할: 백엔드에서 프론트엔드로 사용자 정보를 전달할 때 사용
 * 사용처: /api/users/me 엔드포인트의 응답 데이터
 *
 * 개인회원과 기업회원의 정보를 모두 담을 수 있는 통합 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {

    @JsonProperty("p_user_idx") // JSON 필드명 지정

    private Long pUserIdx; // 사용자 ID (camelCase로 수정)
    /**
     * 사용자 이메일
     * - 개인회원: 로그인 시 사용하는 이메일
     * - 기업회원: 담당자 이메일
     */
    private String email;
    /**
     * 사용자 이름
     * - 개인회원: 본명
     * - 기업회원: 담당자명
     */
    private String name;
    /**
     * OAuth2 로그인 제공자
     * - 개인회원: "google", "kakao" 등 (일반 회원가입은 null)
     * - 기업회원: 항상 null (소셜 로그인 미지원)
     */
    private String provider;
    /**
     * 닉네임
     * - 개인회원: 커뮤니티 등에서 사용하는 닉네임
     * - 기업회원: null (닉네임 기능 없음)
     */
    private String nickname;

    /**
     * 회원 타입
     * - PERSONAL: 개인회원
     * - COMPANY: 기업회원
     *
     * 용도: 프론트엔드에서 마이페이지 메뉴 분기, 권한 체크 등에 사용
     */
    private UserType userType;

    // 추가 필드: 마이페이지/폼 자동 채움에 필요
    private String phoneNumber; // 개인유저 전화번호
    private String address;     // 개인유저 주소
    private String gender;      // 성별 문자열(MALE/FEMALE)
    private String birthDate;   // 생년월일(YYYY-MM-DD)

    // 호환용 생성자(기존 사용 코드 유지): pUserIdx, email, name, provider, nickname, userType
    public UserDto(Long pUserIdx, String email, String name, String provider, String nickname, UserType userType) {
        this.pUserIdx = pUserIdx;
        this.email = email;
        this.name = name;
        this.provider = provider;
        this.nickname = nickname;
        this.userType = userType;
    }
}
