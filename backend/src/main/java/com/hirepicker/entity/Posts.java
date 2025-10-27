package com.hirepicker.entity;

import io.micrometer.common.lang.NonNull;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Entity
@Getter
@Setter
@SuperBuilder // 현재클래스와 상위클래스의 필드값을 저장하기 위한 메서드들 포함
@AllArgsConstructor
@NoArgsConstructor
@ToString(callSuper = true) // 부모가 가지는 함수사용(필드 포함)
public class Posts {

    @Id
    private Long post_idx;
    private String view_count, created_at, updated_at, file_name, img_name;

    @NonNull
    private String board_idx, p_user_idx, title, content;
}
