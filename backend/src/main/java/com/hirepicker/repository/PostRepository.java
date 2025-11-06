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


// 게시판 카테고리별 게시글 조회
@Query("SELECT new com.hirepicker.dto.PostListDto(p.postIdx, p.boardIdx, p.pUserIdx, u.nickname, p.title, p.content, p.createdAt, p.viewCount, p.imgName, p.fileName) " +
       "FROM Posts p JOIN PersonalUser u ON p.pUserIdx = u.id " +
       "WHERE p.boardIdx = :boardIdx")
Page<PostListDto> findByBoardIdx(@Param("boardIdx") Long boardIdx, Pageable pageable);


// 전체 게시글 조회
@Query("SELECT new com.hirepicker.dto.PostListDto(p.postIdx, p.boardIdx, p.pUserIdx, u.nickname, p.title, p.content, p.createdAt, p.viewCount, p.imgName, p.fileName) " +
       "FROM Posts p JOIN PersonalUser u ON p.pUserIdx = u.id")
Page<PostListDto> findAllPostList(Pageable pageable);


// 게시글 세부내용 조회
@Query("SELECT new com.hirepicker.dto.PostListDto(" +
       "p.postIdx, p.boardIdx, p.pUserIdx, u.nickname, p.title, p.content, p.createdAt, p.viewCount, p.imgName, p.fileName) " +
       "FROM Posts p JOIN PersonalUser u ON p.pUserIdx = u.id " +
       "WHERE p.postIdx = :postIdx")
Optional<PostListDto> findPostDetailWithNickname(@Param("postIdx") Long postIdx);

}

