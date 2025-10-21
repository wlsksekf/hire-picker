package com.hirepicker.config.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.stream.Collectors;

@Slf4j
@Component
public class JwtTokenProvider {

    private static final String AUTHORITIES_KEY = "auth"; // 권한 정보 키
    private final Key key; // 서명 키
    private final long accessTokenValidityInMilliseconds; // 액세스 토큰 유효 기간
    private final long refreshTokenValidityInMilliseconds; // 리프레시 토큰 유효 기간

    public JwtTokenProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-token-validity-in-seconds}") long accessTokenValidityInSeconds,
            @Value("${jwt.refresh-token-validity-in-seconds}") long refreshTokenValidityInSeconds) {
        byte[] keyBytes = Decoders.BASE64.decode(secret); // 시크릿 키를 Base64 디코딩
        this.key = Keys.hmacShaKeyFor(keyBytes); // HMAC SHA 키 생성
        this.accessTokenValidityInMilliseconds = accessTokenValidityInSeconds * 1000; // 유효 기간을 밀리초로 변환
        this.refreshTokenValidityInMilliseconds = refreshTokenValidityInSeconds * 1000; // 리프레시 토큰 유효 기간
    }

    // 액세스 토큰 생성
    public String createAccessToken(Authentication authentication) {
        String authorities = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(",")); // 권한 정보 문자열로 변환

        long now = (new Date()).getTime();
        Date validity = new Date(now + this.accessTokenValidityInMilliseconds); // 만료 시간 설정

        return Jwts.builder()
                .setSubject(authentication.getName()) // 주체 설정
                .claim(AUTHORITIES_KEY, authorities) // 권한 정보 추가
                .signWith(key, SignatureAlgorithm.HS512) // 서명
                .setExpiration(validity) // 만료 시간 설정
                .compact(); // 압축하여 반환
    }

    // 리프레시 토큰 생성
    public String createRefreshToken(Authentication authentication) {
        long now = (new Date()).getTime();
        Date validity = new Date(now + this.refreshTokenValidityInMilliseconds); // 만료 시간 설정

        return Jwts.builder()
                .setSubject(authentication.getName()) // 주체 설정
                .signWith(key, SignatureAlgorithm.HS512) // 서명
                .setExpiration(validity) // 만료 시간 설정
                .compact(); // 압축하여 반환
    }

    // 토큰에서 인증 정보 조회
    public Authentication getAuthentication(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody(); // 토큰 파싱하여 클레임 추출

        Collection<? extends GrantedAuthority> authorities =
                Arrays.stream(claims.get(AUTHORITIES_KEY).toString().split(","))
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList()); // 권한 정보 컬렉션으로 변환

        UserDetails principal = new User(claims.getSubject(), "", authorities); // 사용자 정보 생성

        return new UsernamePasswordAuthenticationToken(principal, token, authorities); // 인증 객체 반환
    }

    // 토큰 유효성 검증
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (io.jsonwebtoken.security.SecurityException | MalformedJwtException e) {
            log.info("잘못된 JWT 서명입니다.");
        } catch (ExpiredJwtException e) {
            log.info("만료된 JWT 토큰입니다.");
        } catch (UnsupportedJwtException e) {
            log.info("지원되지 않는 JWT 토큰입니다.");
        } catch (IllegalArgumentException e) {
            log.info("JWT 토큰이 잘못되었습니다.");
        }
        return false;
    }

    // 토큰에서 사용자 이름(subject) 추출
    public String getUsernameFromToken(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody().getSubject();
    }

    // 토큰에서 만료 시간(expiration date) 추출
    public Date getExpirationDateFromToken(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody().getExpiration();
    }

    // 액세스 토큰 유효 기간 반환
    public long getAccessTokenValidityInMilliseconds() {
        return accessTokenValidityInMilliseconds;
    }

    // 리프레시 토큰 유효 기간 반환
    public long getRefreshTokenValidityInMilliseconds() {
        return refreshTokenValidityInMilliseconds;
    }
}
