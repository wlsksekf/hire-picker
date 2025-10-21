package com.hirepicker.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity // JPA 엔티티임을 선언
@Table(name = "company") // "company" 테이블과 매핑
@Data // @Getter, @Setter, @ToString, @EqualsAndHashCode, @RequiredArgsConstructor를 모두 포함
@Builder // 빌더 패턴을 사용하여 객체 생성
@NoArgsConstructor // 기본 생성자 자동 생성
@AllArgsConstructor // 모든 필드를 포함하는 생성자 자동 생성
public class Company {

    @Id // 기본 키 필드
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 기본 키 값 자동 생성 (DB에 위임)
    @Column(name = "company_idx") // "company_idx" 컬럼과 매핑
    private Long companyIdx;

    @Column(name = "company_id", unique = true) // 유니크한 "company_id" 컬럼과 매핑
    private String companyId;

    @Column(name = "company_name") // "company_name" 컬럼과 매핑
    private String companyName;

    @Lob // 대용량 데이터를 저장하기 위한 어노테이션
    @Column(name = "description", columnDefinition = "TEXT") // "description" 컬럼과 매핑 (타입: TEXT)
    private String description;

    @Column(name = "website_url") // "website_url" 컬럼과 매핑
    private String websiteUrl;

    @Column(name = "business_number") // "business_number" 컬럼과 매핑
    private String businessNumber;

    @Column(name = "logo_url") // "logo_url" 컬럼과 매핑
    private String logoUrl;

    @Column(name = "company_type") // "company_type" 컬럼과 매핑
    private String companyType;

}
