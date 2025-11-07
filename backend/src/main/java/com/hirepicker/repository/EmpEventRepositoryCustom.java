package com.hirepicker.repository;

import java.util.List;

import com.hirepicker.entity.EmpEvent;

public interface EmpEventRepositoryCustom {

    List<EmpEvent> findByAreaContainingAnyOf(List<String> areas);
}
