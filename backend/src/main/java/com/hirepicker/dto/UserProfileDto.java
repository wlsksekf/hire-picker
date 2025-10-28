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
    private String gender;
    private String phoneNumber;
    private String email;
    private String address;

    public static UserProfileDto fromEntity(PersonalUser user) {
        return new UserProfileDto(
            user.getName(),
            user.getGender() != null ? user.getGender().name() : null, // Enum to String
            user.getPhoneNumber(),
            user.getEmail(),
            user.getAddress()
        );
    }
}
