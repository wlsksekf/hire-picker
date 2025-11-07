package com.hirepicker.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.hirepicker.dto.PostListDto;
import com.hirepicker.entity.Posts;
import jakarta.transaction.Transactional;
import java.util.Optional;
import org.springframework.data.repository.query.Param;

@Repository
public interface PostRepository extends JpaRepository<Posts, Long>{

    // 카테고리별 게시글 조회
    @Query("SELECT new com.hirepicker.dto.PostListDto(p.postIdx, p.boardIdx, p.pUserIdx, u.nickname, p.title, p.content, p.createdAt, p.viewCount, p.imgName, p.fileName) " +
           "FROM Posts p JOIN PersonalUser u ON p.pUserIdx = u.id " +
           "WHERE p.boardIdx = :boardIdx")
    Page<PostListDto> findByBoardIdx(@Param("boardIdx") Long boardIdx, Pageable pageable);

    // 전체 게시글 조회
    @Query("SELECT new com.hirepicker.dto.PostListDto(p.postIdx, p.boardIdx, p.pUserIdx, u.nickname, p.title, p.content, p.createdAt, p.viewCount, p.imgName, p.fileName) " +
           "FROM Posts p JOIN PersonalUser u ON p.pUserIdx = u.id")
    Page<PostListDto> findAllPostList(Pageable pageable);

    // 게시글 상세 조회
    @Query("SELECT new com.hirepicker.dto.PostListDto(p.postIdx, p.boardIdx, p.pUserIdx, u.nickname, p.title, p.content, p.createdAt, p.viewCount, p.imgName, p.fileName) " +
           "FROM Posts p JOIN PersonalUser u ON p.pUserIdx = u.id " +
           "WHERE p.postIdx = :postIdx")
    Optional<PostListDto> findPostDetailWithNickname(@Param("postIdx") Long postIdx);

    // 조회수 1 증가 (동시성 안전 Native)
    @Transactional
    @Modifying
    @Query("UPDATE Posts p SET p.viewCount = p.viewCount + 1 WHERE p.postIdx = :postIdx")
    void increaseViewCount(@Param("postIdx") Long postIdx);
}
