package com.hirepicker.entity.BookMark;

import java.math.BigInteger;

import com.hirepicker.entity.JobPosting;
import com.hirepicker.entity.PersonalUser;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;

import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@IdClass(PostingBookMarkId.class)
@Table(name = "posting_bookmark")
public class PostingBookMark {

    @Id
    @Column(name="posting_idx")
    BigInteger postingIdx;

    @Id
    @Column(name="p_user_idx")
    BigInteger pUserIdx;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "posting_idx", insertable = false, updatable = false)
    private JobPosting posting;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "p_user_idx", insertable = false, updatable = false)
    private PersonalUser user;

}
