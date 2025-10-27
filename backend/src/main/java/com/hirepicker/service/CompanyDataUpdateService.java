package com.hirepicker.service;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Path;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hirepicker.entity.Company;
import com.hirepicker.repository.CompanyRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompanyDataUpdateService {

    private final CompanyRepository companyRepository;

    private static final String CSV_FILE_PATH = "src/main/resources/data/company_data.csv";
    private static final String CompanyDataList = "src/main/resources/data/company_data_list.txt";

    /** progress.txt에서 마지막 처리된 줄 번호 읽기 */
    private int readLastProcessedLine() {
        try {
            File file = new File(CompanyDataList);
            if (!file.exists())
                return 0;
            return Integer.parseInt(Files.readString(file.toPath()).trim());
        } catch (Exception e) {
            log.warn("진행상황 파일을 읽을 수 없습니다. 처음부터 시작합니다.");
            return 0;
        }
    }

    /** 현재까지 진행된 줄 번호를 progress.txt에 저장 */
    private void saveProgress(int lineNumber) {
        try {
            Files.writeString(Path.of(CompanyDataList), String.valueOf(lineNumber));
        } catch (IOException e) {
            log.error("진행상황 저장 실패", e);
        }
    }

    /** CSV를 읽어 DB 업데이트, 중간 진행상황 저장 */
    @Transactional
    public int updateCompanyDataFromCsv() throws Exception {
        int updatedCount = 0;
        int lastProcessedLine = readLastProcessedLine();
        int currentLine = 0;

        try (BufferedReader br = new BufferedReader(
                new InputStreamReader(new FileInputStream(CSV_FILE_PATH), Charset.forName("MS949")))) {

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
                    var opt = companyRepository.findByCompanyName(companyName);
                    if (opt.isPresent()) {
                        Company company = opt.get();
                        updateCompanyInfo(company, employeeCount, roadAddress, jibunAddress, industryCategory);
                        companyRepository.save(company);
                        updatedCount++;
                    } else {
                        log.debug("Not found in DB: {}", companyName);
                    }
                }

                // 💾 100줄마다 진행상황 저장
                if (currentLine % 100 == 0) {
                    saveProgress(currentLine);
                    log.info("Progress saved at line: {}", currentLine);
                }
            }

            // 마지막 줄까지 완료 후 저장
            saveProgress(currentLine);
            log.info("작업 완료! 총 {}건 업데이트됨 (마지막 줄: {})", updatedCount, currentLine);

            return updatedCount;
        } catch (Exception e) {
            log.error("CSV 업데이트 중 오류 발생", e);
            throw e;
        }
    }

    private void updateCompanyInfo(Company company, String employeeCount, String roadAddress,
            String jibunAddress, String industryCategory) {
        if (employeeCount != null) {
            company.setEmployeeCount(employeeCount);
        }

        if (roadAddress != null && !roadAddress.trim().isEmpty()) {
            company.setAddress(roadAddress);
        } else if (jibunAddress != null && !jibunAddress.trim().isEmpty()) {
            company.setAddress(jibunAddress);
        }

        if (industryCategory != null) {
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
