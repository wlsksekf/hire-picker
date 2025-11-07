package com.hirepicker.service;

import java.math.BigInteger;

import org.springframework.stereotype.Service;

import com.hirepicker.repository.BookMarkRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookMarkService{

    private final BookMarkRepository bookMarkRepository;

    public boolean isBookmarked(String p_user, String postIdx){
            BigInteger pUserIdx= new BigInteger(p_user);
            BigInteger postingIdx = new BigInteger(postIdx);
            return bookMarkRepository.existsByPUserIdxAndPostingIdx(pUserIdx, postingIdx);

    }


}
