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
        // 쿼리를 만드는 도구 (WHERE, LIKE 등 조건 생성)
        CriteriaBuilder cb = em.getCriteriaBuilder();
        // 실제 쿼리 객체 (결과 타입이 EmpEvent)
        CriteriaQuery<EmpEvent> cq = cb.createQuery(EmpEvent.class);
        // FROM EmpEvent e 와 같은 역할 (쿼리의 기본 테이블)
        Root<EmpEvent> root = cq.from(EmpEvent.class);

        // SELECT e FROM EmpEvent e
        cq.select(root);

        if (areas != null && !areas.isEmpty()) {
            // 조건들을 담을 리스트
            List<Predicate> predicates = new ArrayList<>();

            // 각 area 마다 LIKE 조건 추가 -> WHERE e.area LIKE '%서울%' OR e.area LIKE '%부산%'
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
