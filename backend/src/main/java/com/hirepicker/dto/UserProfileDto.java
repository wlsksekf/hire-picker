package com.hirepicker.dto;

import com.hirepicker.entity.PersonalUser;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDto {
    private String name;
    private String nickname;
    private String email;
    private String imageUrl;
    private String gender;
    private String phoneNumber;
    private String address;

    public static UserProfileDto fromEntity(PersonalUser user) {
        return new UserProfileDto(
            user.getName(),
            user.getNickname(),
            user.getEmail(),
            null, // imageUrl은 현재 DB에 없으므로 null
            user.getGender() != null ? user.getGender().name() : null, // Enum to String
            user.getPhoneNumber(),
            user.getAddress()
        );
    }
}
