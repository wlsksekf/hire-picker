package com.hirepicker.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter@Setter@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Certification {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long certIdx;

    private String certName;

}
