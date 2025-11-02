package com.hirepicker.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hirepicker.entity.Posts;

@Repository
public interface PostRepository extends JpaRepository<Posts, Long>{

    // ⭐ 추가: board_idx와 Pageable을 이용해 게시글 목록 조회
    // 메서드 이름 규칙: 'findBy' + 필드명
    // Spring Data JPA가 board_idx로 조회하고 Pageable에 따라 페이징/정렬을 적용합니다.
    Page<Posts> findByBoardIdx(Long boardIdx, Pageable pageable);
}

