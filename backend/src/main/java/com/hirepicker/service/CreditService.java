package com.hirepicker.service;

import com.hirepicker.config.security.CustomUserDetails;
import com.hirepicker.entity.CompanyUser;
import com.hirepicker.entity.PersonalUser;
import com.hirepicker.entity.UserType;
import com.hirepicker.entity.payment.CompanyUserCredit;
import com.hirepicker.entity.payment.CreditUsageHistory;
import com.hirepicker.entity.payment.PersonalUserCredit;
import com.hirepicker.exception.InsufficientCreditsException;
import com.hirepicker.repository.CompanyUserRepository;
import com.hirepicker.repository.PersonalUserRepository;
import com.hirepicker.repository.payment.CreditUsageHistoryRepository;
import com.hirepicker.repository.payment.CompanyUserCreditRepository;
import com.hirepicker.repository.payment.PersonalUserCreditRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CreditService {

    private final PersonalUserRepository personalUserRepository;
    private final CompanyUserRepository companyUserRepository;
    private final PersonalUserCreditRepository personalUserCreditRepository;
    private final CompanyUserCreditRepository companyUserCreditRepository;
    private final CreditUsageHistoryRepository creditUsageHistoryRepository;

    /**
     * 현재 로그인한 사용자의 크레딧 잔액을 조회합니다.
     * 크레딧 정보가 없으면 새로 생성하고 0을 반환합니다.
     * @param userDetails 현재 인증된 사용자 정보
     * @return 크레딧 잔액
     */
    @Transactional
    public Long getCreditBalance(CustomUserDetails userDetails) {
        if (userDetails.getUserType() == UserType.PERSONAL) {
            PersonalUserCredit credit = personalUserCreditRepository.findById(userDetails.getId())
                    .orElseGet(() -> {
                        PersonalUser user = personalUserRepository.findById(userDetails.getId())
                                .orElseThrow(() -> new EntityNotFoundException("PersonalUser not found"));
                        return personalUserCreditRepository.save(new PersonalUserCredit(user, 0L));
                    });
            return credit.getBalance();
        } else if (userDetails.getUserType() == UserType.COMPANY) {
            CompanyUserCredit credit = companyUserCreditRepository.findById(userDetails.getId())
                    .orElseGet(() -> {
                        CompanyUser user = companyUserRepository.findById(userDetails.getId())
                                .orElseThrow(() -> new EntityNotFoundException("CompanyUser not found"));
                        return companyUserCreditRepository.save(new CompanyUserCredit(user, 0L));
                    });
            return credit.getBalance();
        } else {
            throw new IllegalStateException("알 수 없는 사용자 타입입니다.");
        }
    }

    /**
     * 서비스 사용에 대한 크레딧을 차감합니다.
     * @param userDetails 현재 인증된 사용자 정보
     * @param serviceName 크레딧을 사용한 서비스 이름
     * @param amount 차감할 크레딧 양
     */
    @Transactional
    public void useCredits(CustomUserDetails userDetails, String serviceName, Long amount) {
        CreditUsageHistory.CreditUsageHistoryBuilder historyBuilder = CreditUsageHistory.builder()
                .serviceName(serviceName)
                .creditsUsed(amount);

        if (userDetails.getUserType() == UserType.PERSONAL) {
            PersonalUserCredit credit = personalUserCreditRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new IllegalStateException("개인 사용자 크레딧 정보를 찾을 수 없습니다."));
            
            if (credit.getBalance() < amount) {
                throw new InsufficientCreditsException("크레딧이 부족합니다.");
            }
            
            credit.setBalance(credit.getBalance() - amount);
            historyBuilder.personalUser(credit.getPersonalUser());

        } else if (userDetails.getUserType() == UserType.COMPANY) {
            CompanyUserCredit credit = companyUserCreditRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new IllegalStateException("기업 사용자 크레딧 정보를 찾을 수 없습니다."));

            if (credit.getBalance() < amount) {
                throw new InsufficientCreditsException("크레딧이 부족합니다.");
            }

            credit.setBalance(credit.getBalance() - amount);
            historyBuilder.companyUser(credit.getCompanyUser());

        } else {
            throw new IllegalStateException("알 수 없는 사용자 타입입니다.");
        }

        creditUsageHistoryRepository.save(historyBuilder.build());
    }
}
