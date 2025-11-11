package com.hirepicker.repository;

import java.math.BigInteger;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.hirepicker.entity.BookMark.PostingBookMark;
import com.hirepicker.entity.BookMark.PostingBookMarkId;

import jakarta.transaction.Transactional;

@Repository
public interface BookMarkRepository extends JpaRepository<PostingBookMark, PostingBookMarkId> {

    // 필드명 기준으로 메서드 이름 수정
    boolean existsBypUserIdxAndPostingIdx(BigInteger pUserIdx, BigInteger postingIdx);

    // 개인회원이 찜한 공고 전체 조회 (추가 기능)
    List<PostingBookMark> findBypUserIdx(BigInteger pUserIdx);

    @Modifying
    @Transactional  // 삭제 쿼리에는 필요
    @Query("DELETE FROM PostingBookMark b WHERE b.pUserIdx = :pUserIdx AND b.postingIdx = :postingIdx")
    int deleteBookmark(@Param("pUserIdx") BigInteger pUserIdx, @Param("postingIdx") BigInteger postingIdx);
}

