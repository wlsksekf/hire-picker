package com.hirepicker.service;

import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.hirepicker.entity.Company;
import com.hirepicker.repository.CompanyRepository;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompanyDataUpdateService {

    private final CompanyRepository companyRepository;

    private final Path dataDirPath = Path.of(System.getProperty("user.home"), ".hirepicker_data");
    private final Path csvFilePath = dataDirPath.resolve("company_data.csv");
    private final Path progressFilePath = dataDirPath.resolve("company_data_list.txt");

    @PostConstruct
    private void init() {
        try {
            if (!Files.exists(dataDirPath)) {
                Files.createDirectories(dataDirPath);
                log.info("Created data directory at: {}", dataDirPath);
            }
        } catch (IOException e) {
            log.error("Failed to create data directory", e);
            throw new RuntimeException("Could not initialize CompanyDataUpdateService", e);
        }
    }

    /** progress.txt에서 마지막 처리된 줄 번호 읽기 */
    private int readLastProcessedLine() {
        try {
            if (!Files.exists(progressFilePath))
                return 0;
            return Integer.parseInt(Files.readString(progressFilePath).trim());
        } catch (Exception e) {
            log.warn("진행상황 파일을 읽을 수 없습니다. 처음부터 시작합니다.");
            return 0;
        }
    }

    /** 현재까지 진행된 줄 번호를 progress.txt에 저장 */
    private void saveProgress(int lineNumber) {
        try {
            Files.writeString(progressFilePath, String.valueOf(lineNumber));
        } catch (IOException e) {
            log.error("진행상황 저장 실패", e);
        }
    }

    /** CSV를 읽어 DB 업데이트, 중간 진행상황 저장 */
    public int updateCompanyDataFromCsv() throws Exception {
        log.info("CSV 파일에서 회사 데이터 업데이트를 시작합니다. 파일 경로: {}", csvFilePath);
        if (!Files.exists(csvFilePath)) {
            log.error("CSV 파일을 찾을 수 없습니다: {}", csvFilePath);
            throw new IOException("지정된 경로에 company_data.csv 파일이 없습니다.");
        }

        int updatedCount = 0;
        int lastProcessedLine = readLastProcessedLine();
        int currentLine = 0;
        List<Company> companiesToUpdate = new ArrayList<>();

        try (BufferedReader br = new BufferedReader(
                new InputStreamReader(new FileInputStream(csvFilePath.toFile()), Charset.forName("MS949")))) {

            // 헤더 스킵
            String line = br.readLine();

            while ((line = br.readLine()) != null) {
                currentLine++;

                // 이미 처리한 줄은 건너뛰기
                if (currentLine <= lastProcessedLine)
                    continue;

                String[] values = line.split(",");
                if (values.length < 6)
                    continue;

                String companyName = cleanCompanyName(values[0].trim());
                String status = values[1].trim();
                String employeeCount = values[2].trim();
                String roadAddress = values[3].trim();
                String jibunAddress = values[4].trim();
                String industryCategory = values[5].trim();

                if ("1".equals(status)) {
                    // 회사명으로 DB에서 찾기 (중복 레코드가 있을 수 있으므로 안전하게 처리)
                    java.util.List<Company> matches = companyRepository.findAllByCompanyName(companyName);
                    if (!matches.isEmpty()) {
                        if (matches.size() > 1) {
                            log.warn("Multiple companies found with name='{}'. Using first match.", companyName);
                        }
                        Company company = matches.get(0);
                        updateCompanyInfo(company, employeeCount, roadAddress, jibunAddress, industryCategory);
                        companiesToUpdate.add(company); // 업데이트할 회사 정보 모으기
                    } else {
                        log.debug("Not found in DB: {}", companyName);
                    }
                }

                // 100줄마다 배치로 저장
                if (companiesToUpdate.size() >= 100) {
                    companyRepository.saveAll(companiesToUpdate); // 배치로 DB에 저장
                    companyRepository.flush();
                    updatedCount += companiesToUpdate.size();
                    companiesToUpdate.clear(); // 리스트 초기화
                    saveProgress(currentLine); // 진행상황 저장
                    log.info("Batch update complete. Progress saved at line: {}", currentLine);
                }
            }

            // 남아 있는 회사 정보 저장
            if (!companiesToUpdate.isEmpty()) {
                companyRepository.saveAll(companiesToUpdate);
                updatedCount += companiesToUpdate.size();
                saveProgress(currentLine);
            }

            log.info("작업 완료! 총 {}건 업데이트됨 (마지막 줄: {})", updatedCount, currentLine);

            return updatedCount;
        } catch (Exception e) {
            log.error("CSV 업데이트 중 오류 발생", e);
            throw e;
        }
    }

    private void updateCompanyInfo(Company company, String employeeCount, String roadAddress,
            String jibunAddress, String industryCategory) {

        // 직원 수가 null이거나 빈 문자열이 아니면 업데이트
        if (employeeCount != null && !employeeCount.trim().isEmpty()) {
            company.setEmployeeCount(employeeCount);
        }

        // 도로명 주소 우선, 없으면 지번 주소 — 단, 값이 비어있지 않을 때만 업데이트
        if (roadAddress != null && !roadAddress.trim().isEmpty()) {
            company.setAddress(roadAddress);
        } else if (jibunAddress != null && !jibunAddress.trim().isEmpty()) {
            company.setAddress(jibunAddress);
        }

        // 산업분류가 비어있지 않으면 업데이트
        if (industryCategory != null && !industryCategory.trim().isEmpty()) {
            company.setIndustryCategory(industryCategory);
        }
    }

    private String cleanCompanyName(String rawName) {
        if (rawName == null)
            return "";
        return rawName
                .replaceAll("\\(주\\)", "") // (주)
                .replaceAll("㈜", "") // ㈜
                .replaceAll("주식회사", "") // 주식회사
                .replaceAll("\\s+", "") // 모든 공백 제거 (선택사항)
                .trim();
    }
}
