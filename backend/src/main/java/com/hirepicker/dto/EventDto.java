package com.hirepicker.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record EventDto(
    String id,
    String title,
    String period,
    String location
) {}
