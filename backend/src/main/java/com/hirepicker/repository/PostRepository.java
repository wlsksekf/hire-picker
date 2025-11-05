package com.hirepicker.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.hirepicker.dto.PostListDto;
import com.hirepicker.entity.Posts;

import java.util.Optional;

import org.springframework.data.repository.query.Param;


@Repository
public interface PostRepository extends JpaRepository<Posts, Long>{

    // 추가: board_idx와 Pageable을 이용해 게시글 목록 조회
    // 메서드 이름 규칙: 'findBy' + 필드명
    // Spring Data JPA가 board_idx로 조회하고 Pageable에 따라 페이징/정렬을 적용합니다.
    Page<Posts> findByBoardIdx(@Param("boardIdx") Long boardIdx, Pageable pageable);

@Query("SELECT new com.hirepicker.dto.PostListDto(p.postIdx, u.nickname, p.title, p.content, p.createdAt, p.viewCount, p.imgName, p.fileName) " +
       "FROM Posts p JOIN PersonalUser u ON p.pUserIdx = u.id WHERE p.boardIdx = :boardIdx")
Page<PostListDto> findPostListWithNickname(@Param("boardIdx") Long boardIdx, Pageable pageable);



@Query("SELECT new com.hirepicker.dto.PostListDto(" +
       "p.postIdx, u.nickname, p.title, p.content, p.createdAt, p.viewCount, p.imgName, p.fileName) " +
       "FROM Posts p JOIN PersonalUser u ON p.pUserIdx = u.id " +
       "WHERE p.postIdx = :postIdx")
Optional<PostListDto> findPostDetailWithNickname(@Param("postIdx") Long postIdx);

}

