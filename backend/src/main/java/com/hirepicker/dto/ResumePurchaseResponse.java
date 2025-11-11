package com.hirepicker.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ResumePurchaseResponse {
    private final boolean success;
    private final String message;
    private final Long remainingCredits;
    private final boolean alreadyOwned;
}

