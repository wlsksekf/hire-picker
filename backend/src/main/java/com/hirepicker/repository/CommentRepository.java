// src/main/java/com/hirepicker/repository/CommentRepository.java
package com.hirepicker.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.hirepicker.entity.Comment;
import com.hirepicker.dto.CommentResponseDto;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    
    // 기존: 인덱스만으로 조회
    List<Comment> findByPostIdx(Long postIdx);

    // 닉네임 포함 DTO 반환용
    @Query("SELECT new com.hirepicker.dto.CommentResponseDto(" +
           "c.commentIdx, c.postIdx, c.parentIdx, c.pUserIdx, u.nickname, c.content, c.createdAt) " +
           "FROM Comment c JOIN PersonalUser u ON c.pUserIdx = u.id " +
           "WHERE c.postIdx = :postIdx")
    List<CommentResponseDto> findCommentsWithNicknameByPostIdx(@Param("postIdx") Long postIdx);
}
