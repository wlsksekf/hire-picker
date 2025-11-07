package com.hirepicker.repository;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Repository;

import com.hirepicker.entity.EmpEvent;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

@Repository
public class EmpEventRepositoryCustomImpl implements EmpEventRepositoryCustom {

    @PersistenceContext
    private EntityManager em;

    @Override
    public List<EmpEvent> findByAreaContainingAnyOf(List<String> areas) {
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<EmpEvent> cq = cb.createQuery(EmpEvent.class);
        Root<EmpEvent> root = cq.from(EmpEvent.class);

        // SELECT e FROM EmpEvent e
        cq.select(root);

        if (areas != null && !areas.isEmpty()) {
            List<Predicate> predicates = new ArrayList<>();

            // 각 area 마다 LIKE 조건 추가
            for (String area : areas) {
                if (area != null && !area.isBlank()) {
                    predicates.add(cb.like(root.get("area"), "%" + area + "%"));
                }
            }

            // OR로 묶기 (하나라도 포함되면 true)
            cq.where(cb.or(predicates.toArray(new Predicate[0])));
        }

        return em.createQuery(cq).getResultList();
    }
}
