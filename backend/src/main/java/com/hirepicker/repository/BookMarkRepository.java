package com.hirepicker.repository;

import java.math.BigInteger;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.hirepicker.entity.BookMark.PostingBookMark;
import com.hirepicker.entity.BookMark.PostingBookMarkId;

import io.lettuce.core.dynamic.annotation.Param;
import jakarta.transaction.Transactional;

@Repository
public interface BookMarkRepository extends JpaRepository<PostingBookMark, PostingBookMarkId> {

    // 필드명 기준으로 메서드 이름 수정
    boolean existsBypUserIdxAndPostingIdx(BigInteger pUserIdx, BigInteger postingIdx);

    @Modifying
    @Transactional  // 삭제 쿼리에는 필요
    @Query("DELETE FROM PostingBookMark b WHERE b.pUserIdx = :pUserIdx AND b.postingIdx = :postingIdx")
    int deleteBookmark(@Param("pUserIdx") BigInteger pUserIdx, @Param("postingIdx") BigInteger postingIdx);
}

