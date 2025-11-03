package com.hirepicker.dto;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {

    @JsonProperty("p_user_idx") // JSON 필드명 지정

    private Long pUserIdx; // 사용자 ID (camelCase로 수정)

    private String email;

    private String name;

    private String provider;

    private String nickname;

}
