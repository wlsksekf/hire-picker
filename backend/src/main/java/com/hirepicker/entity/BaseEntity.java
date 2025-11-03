package com.hirepicker.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

// 모든 엔티티의 공통 필드를 정의하는 기본 클래스
@Getter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {

    @CreatedDate
    @Column(name = "reg_date", updatable = false) // DB 컬럼명 'reg_date'와 매핑
    private LocalDateTime createdDate;

    @LastModifiedDate
    @Column(name = "mod_date") // DB 컬럼명 'mod_date'와 매핑
    private LocalDateTime modifiedDate;
}
