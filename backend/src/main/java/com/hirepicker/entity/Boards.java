package com.hirepicker.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// 게시판 엔티티(boards 테이블 매핑)
@Entity
@Table(name = "boards")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Boards {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "board_idx")
    private Long boardIdx; // PK

    @Column(nullable = false, length = 50)
    private String name; // 게시판 이름

    @Column(length = 255)
    private String description; // 게시판 설명
}

