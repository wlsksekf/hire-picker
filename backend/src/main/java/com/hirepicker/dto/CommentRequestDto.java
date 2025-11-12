// CommentRequestDto.java
package com.hirepicker.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
public class CommentRequestDto {

    @Column(name = "p_user_idx")
    private Long pUserIdx;

    private Long postIdx;
    private String content;

        // **꼭 아래처럼 getter에만 JsonProperty 걸어서 단일 키만 보장!**
    @JsonProperty("pUserIdx")
    public Long getPUserIdx() {
        return pUserIdx;
    }

    public void setPUserIdx(Long pUserIdx) {
        this.pUserIdx = pUserIdx;
    }
}
