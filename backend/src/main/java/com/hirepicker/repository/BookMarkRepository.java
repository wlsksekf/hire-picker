package com.hirepicker.repository;

import java.math.BigInteger;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hirepicker.entity.BookMark.PostingBookMark;
import com.hirepicker.entity.BookMark.PostingBookMarkId;

@Repository
public interface BookMarkRepository extends JpaRepository<PostingBookMark,PostingBookMarkId>{

      boolean existsByPUserIdxAndPostingIdx(BigInteger pUserIdx, BigInteger postingIdx);


}
