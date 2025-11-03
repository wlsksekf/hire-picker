package com.hirepicker.result;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ResultData<T> {
    private int code;
    private String msg;
    private T data;

    public static <T> ResultData<T> of(int code, String msg, T data) {
        return new ResultData<>(code, msg, data);
    }
}
