package com.hirepicker.service;

import java.math.BigInteger;

import org.springframework.stereotype.Service;

import com.hirepicker.entity.BookMark.PostingBookMark;
import com.hirepicker.repository.BookMarkRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookMarkService{

    private final BookMarkRepository bookMarkRepository;

    public boolean isBookmarked(String p_user, String postIdx){
            BigInteger pUserIdx= new BigInteger(p_user);
            BigInteger postingIdx = new BigInteger(postIdx);
            return bookMarkRepository.existsBypUserIdxAndPostingIdx(pUserIdx, postingIdx);
    }


    public int addBookmark(String userId, String postIdx) {
        if (isBookmarked(userId, postIdx)) {
            return 0;
        }

        PostingBookMark bookmark = new PostingBookMark();
        bookmark.setPUserIdx(new BigInteger(userId));
        bookmark.setPostingIdx(new BigInteger(postIdx));

        bookMarkRepository.save(bookmark);
        return 1;
    }

    public int deleteBookmark(String userId, String postIdx) {
        BigInteger pUserIdx = new BigInteger(userId);
        BigInteger postingIdx = new BigInteger(postIdx);
        return bookMarkRepository.deleteBookmark(pUserIdx, postingIdx);
    }


}
