package com.hirepicker.entity.BookMark;

import java.io.Serializable;
import java.math.BigInteger;
import java.util.Objects;

public class PostingBookMarkId implements Serializable {

    private BigInteger postingIdx;
    private BigInteger pUserIdx;

    public PostingBookMarkId() {}

    public PostingBookMarkId(BigInteger postingIdx, BigInteger p_user_idx) {
        this.postingIdx = postingIdx;
        this.pUserIdx = p_user_idx;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PostingBookMarkId)) return false;
        PostingBookMarkId that = (PostingBookMarkId) o;
        return Objects.equals(postingIdx, that.postingIdx) &&
               Objects.equals(pUserIdx, that.pUserIdx);
    }

    @Override
    public int hashCode() {
        return Objects.hash(postingIdx, pUserIdx);
    }
}
