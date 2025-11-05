package com.hirepicker.dto;


import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter@Setter@AllArgsConstructor@NoArgsConstructor
public class SearchFilterDTO {
    private String searchTerm;
    private Map<String, List<String>> filters;
}
