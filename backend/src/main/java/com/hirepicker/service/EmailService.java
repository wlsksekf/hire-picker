package com.hirepicker.service;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.SecureRandom;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    @Value("${sendgrid.api-key}")
    private String sendGridApiKey;

    // ★ 중요: 이메일 발신자 주소. SendGrid에 'Sender'로 등록/인증된 이메일이어야 함.
    private static final String FROM_EMAIL = "jinaniyagi@gmail.com";
    private static final String VERIFICATION_CODE_PREFIX = "verify:";
    private static final long CODE_EXPIRATION_MINUTES = 5; // 5분

    // RedisConfig.java에 이미 빈으로 등록된 StringRedisTemplate 주입
    private final StringRedisTemplate redisTemplate;

    /**
     * 인증 코드를 생성하여 Redis에 저장하고, SendGrid를 통해 이메일 발송
     *
     * @param toEmail 인증 코드를 받을 이메일 주소
     */
    public void sendVerificationCode(String toEmail) {
        // 1. 6자리 인증 코드 생성
        String code = createVerificationCode();
        String redisKey = VERIFICATION_CODE_PREFIX + toEmail;

        // 2. Redis에 저장 (5분 유효)
        redisTemplate.opsForValue().set(redisKey, code, CODE_EXPIRATION_MINUTES, TimeUnit.MINUTES);
        log.info("인증 코드 Redis 저장 완료. Key: {}, Expiry: {} 분", redisKey, CODE_EXPIRATION_MINUTES);

        // 3. SendGrid를 사용한 이메일 발송
        Email from = new Email(FROM_EMAIL);
        String subject = "[HirePicker] 회원가입 인증 코드입니다.";
        Email to = new Email(toEmail);
        Content content = new Content("text/plain", "HirePicker 회원가입을 위한 인증 코드입니다.\n\n인증 코드: " + code + "\n\n5분 이내에 입력해주세요.");
        Mail mail = new Mail(from, subject, to, content);

        SendGrid sg = new SendGrid(sendGridApiKey);
        Request request = new Request();
        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            Response response = sg.api(request);
            
            log.info("SendGrid 이메일 발송 요청. To: {}, Status Code: {}", toEmail, response.getStatusCode());
            if (response.getStatusCode() >= 400) {
                log.error("SendGrid 발송 실패: {}", response.getBody());
                throw new RuntimeException("이메일 발송에 실패했습니다. SendGrid 응답: " + response.getBody());
            }
        } catch (IOException ex) {
            log.error("SendGrid API 호출 중 IOException 발생", ex);
            // Redis에 저장된 코드 롤백 (선택적)
            // redisTemplate.delete(redisKey);
            throw new RuntimeException("이메일 발송 중 시스템 오류가 발생했습니다.");
        }
    }

    /**
     * 유저가 입력한 인증 코드 검증
     *
     * @param email 검증할 이메일
     * @param code  유저가 입력한 6자리 코드
     * @return 검증 성공 여부
     */
    public boolean verifyCode(String email, String code) {
        String redisKey = VERIFICATION_CODE_PREFIX + email;
        String storedCode = redisTemplate.opsForValue().get(redisKey);

        if (storedCode == null) {
            log.warn("인증 코드 검증 실패: 만료되었거나 존재하지 않는 키. Key: {}", redisKey);
            return false;
        }

        if (storedCode.equals(code)) {
            log.info("인증 코드 검증 성공. Key: {}", redisKey);
            redisTemplate.delete(redisKey); // ★ 검증 성공 시 즉시 삭제
            return true;
        }

        log.warn("인증 코드 검증 실패: 코드가 일치하지 않음. Key: {}", redisKey);
        return false;
    }

    /**
     * [신규] 유저가 입력한 인증 코드가 유효한지 확인만 함 (삭제 X)
     *
     * @param email 검증할 이메일
     * @param code  유저가 입력한 6자리 코드
     * @return 검증 성공 여부
     */
    public boolean checkCode(String email, String code) {
        String redisKey = VERIFICATION_CODE_PREFIX + email;
        String storedCode = redisTemplate.opsForValue().get(redisKey);

        if (storedCode == null) {
            log.warn("인증 코드 확인 실패: 만료되었거나 존재하지 않는 키. Key: {}", redisKey);
            return false;
        }

        if (storedCode.equals(code)) {
            log.info("인증 코드 확인 성공. Key: {}", redisKey);
            return true;
        }

        log.warn("인증 코드 확인 실패: 코드가 일치하지 않음. Key: {}", redisKey);
        return false;
    }

    /**
     * 6자리 숫자 난수 생성 (100000 ~ 999999)
     */
    private String createVerificationCode() {
        SecureRandom random = new SecureRandom();
        int code = 100000 + random.nextInt(900000);
        return String.valueOf(code);
    }
}
