package com.hirepicker.service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

import org.json.JSONArray;
import org.json.JSONObject;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.hirepicker.entity.Company;
import com.hirepicker.repository.CompanyRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 간단한 크롤러 서비스
 * - Jsoup를 사용하여 회사 웹사이트의 메타/본문을 추출하고 Company 엔티티를 업데이트합니다.
 * - 실제 프로덕션에서는 robots.txt, 사용자 에이전트, rate-limit, 에러/재시도 정책을 반드시 준수하세요.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CompanyInfoCrawlerService {

    private final CompanyRepository companyRepository;
    private final File progressFile = new File("crawler_progress.txt");
    private final AtomicBoolean isRunning = new AtomicBoolean(false);
    private final AtomicInteger processedCount = new AtomicInteger(0);
    private final AtomicInteger totalCount = new AtomicInteger(0);
    private final int BATCH_SIZE = 100;
    private final int DELAY_MS = 1000; // 1초 딜레이

    // URL 패턴 목록
    private final List<String> URL_PATTERNS = Arrays.asList(
            "", // 메인 페이지
            "/about",
            "/company",
            "/about-us",
            "/introduce",
            "/kr/about",
            "/ko/about",
            "/company/about",
            "/company/introduction",
            "/intro/about",
            "/about/company",
            "/information");

    // CSS 선택자 목록
    private final List<String> CEO_SELECTORS = Arrays.asList(
            "[itemprop=founder]",
            ".ceo",
            ".founder",
            ".representative",
            ".executive",
            "#ceo",
            ".company-ceo",
            ".about-ceo",
            "[itemprop=CEO]",
            ".company-representative",
            // 추가된 선택자
            ".president",
            ".leader",
            ".representative-name");

    private final List<String> ABOUT_SELECTORS = Arrays.asList(
            ".about",
            ".company-about",
            ".company-profile",
            "#about",
            "#company-intro",
            ".introduction",
            ".company-introduction",
            ".about-company",
            ".company-info",
            ".company-overview",
            // 추가된 선택자
            "#introduction",
            ".corp-info",
            ".company-description",
            ".vision",
            ".mission");

    private final List<String> BUSINESS_AREA_SELECTORS = Arrays.asList(
            ".business-area",
            ".business",
            ".services",
            ".products",
            "#business",
            ".business-field",
            ".business-info",
            ".company-business",
            // 추가된 선택자
            "#services",
            ".solutions",
            ".what-we-do",
            ".service-list");

    private final List<String> ADDRESS_SELECTORS = Arrays.asList(
            "[itemprop=address]",
            ".address",
            ".addr",
            ".company-address",
            "footer address",
            ".contact-address",
            "#address",
            ".location",
            // 추가된 선택자
            ".location-info",
            ".contact-info .address",
            ".map-info");

    // 추가 선택자 목록: 연혁, 주요 제품
    private final List<String> HISTORY_SELECTORS = Arrays.asList(
            ".history",
            ".company-history",
            "#history",
            ".timeline",
            ".company-timeline",
            // 추가된 선택자
            ".milestones",
            ".our-history",
            ".company-milestones");

    private final List<String> MAIN_PRODUCTS_SELECTORS = Arrays.asList(
            ".products",
            ".main-products",
            ".product-list",
            ".services",
            ".products-list",
            ".product-items",
            // 추가된 선택자
            "#products",
            ".portfolio",
            ".product-lineup");

    // 메타/오픈그래프/키워드/푸터 선택자 목록
    private final List<String> META_DESC_SELECTORS = Arrays.asList(
            "meta[property=og:description]",
            "meta[name=description]");

    private final List<String> OG_TITLE_SELECTORS = Arrays.asList(
            "meta[property=og:title]",
            "title");

    private final List<String> OG_IMAGE_SELECTORS = Arrays.asList(
            "meta[property=og:image]",
            "meta[name=twitter:image]");

    private final List<String> KEYWORDS_SELECTORS = Arrays.asList(
            "meta[name=keywords]");

    private final List<String> FOOTER_SELECTORS = Arrays.asList(
            "footer",
            ".footer",
            "#footer");

    private final List<String> JSON_LD_SELECTORS = Arrays.asList(
            "script[type=application/ld+json]");

    /**
     * 매주 월요일 새벽 2시에 실행
     */
    // @Scheduled(cron = "0 0 2 * * 1") // 매주 월요일 02:00
    public void scheduledUpdateAllCompanies() {
        if (!isRunning.get()) {
            startCrawling();
        }
    }

    public void startCrawling() {
        if (isRunning.get()) {
            log.info("크롤링이 이미 실행 중입니다.");
            return;
        }

        new Thread(() -> {
            try {
                isRunning.set(true);
                processCompanies();
            } finally {
                isRunning.set(false);
                processedCount.set(0);
                totalCount.set(0);
            }
        }, "company-crawler").start();
    }

    private void processCompanies() {

        // 10개의 스레드를 가진 고정 스레드 풀 생성

        ExecutorService executor = Executors.newFixedThreadPool(10);

        int page = 0;

        final String lastProcessedId = readProgress();

        totalCount.set((int) companyRepository.count());

        try {

            while (true) {

                Page<Company> companies = companyRepository.findAll(

                        PageRequest.of(page, BATCH_SIZE,
                                org.springframework.data.domain.Sort.by("companyIdx").ascending()));

                if (!companies.hasContent()) {

                    break;

                }

                for (final Company company : companies) {

                    executor.submit(() -> {

                        if (!lastProcessedId.isEmpty() && company.getCompanyIdx() != null &&

                                company.getCompanyIdx().toString().compareTo(lastProcessedId) <= 0) {

                            return; // continue와 동일한 효과

                        }

                        try {

                            crawlAndUpdateCompany(company);

                            // saveProgress는 여러 스레드에서 동시에 파일에 쓰려고 하면 문제가 생길 수 있으므로 동기화 처리

                            synchronized (this) {

                                if (company.getCompanyIdx() != null) {

                                    saveProgress(company.getCompanyIdx().toString());

                                }

                            }

                            int currentCount = processedCount.incrementAndGet();

                            log.info("Progress: {}/{} companies processed", currentCount, totalCount.get());

                            // 개별 스레드에서 딜레이를 유지하여 특정 서버에 대한 과부하 방지

                            Thread.sleep(DELAY_MS);

                        } catch (Exception e) {

                            log.error("Failed to process company idx {}: {}",

                                    company.getCompanyIdx() != null ? company.getCompanyIdx() : "unknown",

                                    e.getMessage());

                        }

                    });

                }

                page++;

            }

        } finally {

            // 모든 작업이 제출되면 스레드 풀을 종료

            executor.shutdown();

            try {

                // 모든 작업이 완료될 때까지 최대 1시간 대기

                if (!executor.awaitTermination(1, TimeUnit.HOURS)) {

                    log.error("Crawler tasks did not complete within 1 hour.");

                    executor.shutdownNow();

                }

            } catch (InterruptedException e) {

                log.error("Crawler was interrupted.");

                executor.shutdownNow();

                Thread.currentThread().interrupt();

            }

        }

        // 모든 크롤링이 성공적으로 완료된 후 진행 상황 초기화

        log.info("Crawling finished. Processed {} companies.", processedCount.get());

        resetProgress();

    }

    private String readProgress() {
        try {
            if (progressFile.exists()) {
                return Files.readString(progressFile.toPath()).trim();
            }
        } catch (Exception e) {
            log.error("Failed to read progress: {}", e.getMessage());
        }
        return "";
    }

    private void saveProgress(String companyId) {
        try {
            Files.writeString(progressFile.toPath(), companyId);
        } catch (Exception e) {
            log.error("Failed to save progress: {}", e.getMessage());
        }
    }

    private void resetProgress() {
        try {
            Files.deleteIfExists(progressFile.toPath());
        } catch (Exception e) {
            log.error("Failed to reset progress: {}", e.getMessage());
        }
    }

    public boolean isRunning() {
        return isRunning.get();
    }

    public int getProgress() {
        if (totalCount.get() == 0)
            return 0;
        return (int) ((processedCount.get() * 100.0) / totalCount.get());
    }

    /**
     * 특정 회사의 웹사이트를 크롤링해서 추가 정보를 채웁니다.
     */
    public void crawlAndUpdateCompany(Company company) throws IOException {
        String baseUrl = company.getWebsiteUrl();
        boolean websiteUrlWasEmpty = (baseUrl == null || baseUrl.isBlank());

        if (websiteUrlWasEmpty) {
            if (company.getCompanyName() == null || company.getCompanyName().isBlank()) {
                log.warn("Company name is also empty for companyId: {}. Cannot search. Skipping.",
                        company.getCompanyId());
                return;
            }
            log.info("Website URL for company '{}' is empty. Searching on Google...", company.getCompanyName());
            try {
                String query = company.getCompanyName() + " 공식 홈페이지";
                String searchUrl = "https://www.google.com/search?q="
                        + java.net.URLEncoder.encode(query, java.nio.charset.StandardCharsets.UTF_8);

                Document searchDoc = Jsoup.connect(searchUrl)
                        .userAgent(
                                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36")
                        .header("Accept-Language", "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7")
                        .get();

                // Google 검색 결과의 첫 번째 링크를 찾습니다. (선택자는 변경될 수 있습니다)
                Element firstLink = searchDoc.selectFirst("div.g a");

                if (firstLink != null) {
                    String foundUrl = firstLink.attr("href");

                    // Google의 리디렉션 URL(/url?q=...)에서 실제 URL을 추출합니다.
                    if (foundUrl.startsWith("/url?q=")) {
                        foundUrl = java.net.URLDecoder.decode(foundUrl.substring(7).split("&")[0],
                                java.nio.charset.StandardCharsets.UTF_8);
                    }

                    if (foundUrl != null && foundUrl.startsWith("http")) {
                        log.info("Found website for {}: {}", company.getCompanyName(), foundUrl);
                        baseUrl = foundUrl;
                        company.setWebsiteUrl(baseUrl); // 찾은 URL을 엔티티에 설정
                    }
                }
            } catch (Exception e) {
                log.error("Failed to find website for {} on Google: {}", company.getCompanyName(), e.getMessage());
                return; // 구글 검색 실패 시 크롤링 중단
            }
        }

        if (baseUrl == null || baseUrl.isBlank()) {
            log.warn("Could not find a valid website for company {}. Skipping.", company.getCompanyName());
            return;
        }

        if (!baseUrl.startsWith("http")) {
            baseUrl = "http://" + baseUrl;
        }

        // 끝에 슬래시가 있으면 제거
        baseUrl = baseUrl.replaceAll("/$", "");

        Document doc = null;
        String successUrl = null;

        // 각 URL 패턴을 시도
        for (String pattern : URL_PATTERNS) {
            String url = baseUrl + pattern;
            try {
                doc = Jsoup.connect(url)
                        .userAgent("Mozilla/5.0 (compatible; HirePickerBot/1.0)")
                        .timeout(7000)
                        .followRedirects(true)
                        .get();

                // 페이지가 유효한지 간단히 체크 (최소 텍스트 길이)
                if (doc.text().length() > 100) {
                    successUrl = url;
                    break;
                }
            } catch (Exception e) {
                log.debug("Failed to crawl {}: {}", url, e.getMessage());
            }
        }

        if (doc == null) {
            log.info("Could not find valid page for company {}", company.getCompanyId());
            return;
        }

        // meta description (META_DESC_SELECTORS 사용)
        String metaDesc = null;
        for (String sel : META_DESC_SELECTORS) {
            Element el = doc.selectFirst(sel);
            if (el != null) {
                metaDesc = el.attr("content");
                break;
            }
        }

        // 간단한 본문 스니펫 추출: ABOUT_SELECTORS를 순차적으로 시도
        String aboutText = null;
        for (String selector : ABOUT_SELECTORS) {
            Element aboutEl = doc.selectFirst(selector);
            if (aboutEl != null && !aboutEl.text().isBlank()) {
                aboutText = aboutEl.text().trim();
                break;
            }
        }

        // 사업 영역 / 제품: BUSINESS_AREA_SELECTORS를 순차적으로 시도
        String businessAreas = null;
        for (String selector : BUSINESS_AREA_SELECTORS) {
            Element bizEl = doc.selectFirst(selector);
            if (bizEl != null && !bizEl.text().isBlank()) {
                businessAreas = bizEl.text().trim();
                break;
            }
        }

        // 회사 연혁/연혁 섹션: HISTORY_SELECTORS를 순차적으로 시도
        String history = null;
        for (String selector : HISTORY_SELECTORS) {
            Element histEl = doc.selectFirst(selector);
            if (histEl != null && !histEl.text().isBlank()) {
                history = histEl.text().trim();
                break;
            }
        }

        // CEO / 주소 추출: JSON-LD 우선, 그 다음 흔한 CSS 선택자, 마지막으로 페이지 텍스트 기반 휴리스틱
        String extractedCeo = null;
        String extractedAddress = null;

        // 1) JSON-LD (schema.org Organization 혹은 LocalBusiness) 파싱
        Elements jsonLdEls = new Elements();
        for (String sel : JSON_LD_SELECTORS) {
            jsonLdEls.addAll(doc.select(sel));
        }
        for (Element jsonEl : jsonLdEls) {
            String json = jsonEl.html();
            try {
                // JSON-LD 문자열을 JSONObject 또는 JSONArray로 파싱 시도
                JSONObject jo = null;
                try {
                    jo = new JSONObject(json);
                } catch (Exception e) {
                    try {
                        JSONArray ja = new JSONArray(json);
                        if (ja.length() > 0 && ja.optJSONObject(0) != null)
                            jo = ja.optJSONObject(0);
                    } catch (Exception ignore) {
                    }
                }

                if (jo != null) {
                    if (jo.has("founder")) {
                        Object founderObj = jo.get("founder");
                        if (founderObj instanceof JSONObject) {
                            JSONObject f = (JSONObject) founderObj;
                            if (f.has("name"))
                                extractedCeo = f.optString("name");
                        } else if (founderObj instanceof JSONArray) {
                            JSONArray fa = (JSONArray) founderObj;
                            if (fa.length() > 0) {
                                Object first = fa.get(0);
                                if (first instanceof JSONObject)
                                    extractedCeo = ((JSONObject) first).optString("name");
                                else
                                    extractedCeo = first.toString();
                            }
                        } else {
                            extractedCeo = founderObj.toString();
                        }
                    }

                    if (jo.has("address")) {
                        Object addr = jo.get("address");
                        if (addr instanceof JSONObject) {
                            JSONObject a = (JSONObject) addr;
                            StringBuilder sb = new StringBuilder();
                            if (a.has("streetAddress"))
                                sb.append(a.optString("streetAddress"));
                            if (a.has("addressLocality")) {
                                if (sb.length() > 0)
                                    sb.append(", ");
                                sb.append(a.optString("addressLocality"));
                            }
                            if (a.has("addressRegion")) {
                                if (sb.length() > 0)
                                    sb.append(", ");
                                sb.append(a.optString("addressRegion"));
                            }
                            if (sb.length() > 0)
                                extractedAddress = sb.toString();
                        } else {
                            extractedAddress = addr.toString();
                        }
                    }
                }
            } catch (Exception ex) {
                // json 파싱 실패는 무시
            }
            if (extractedCeo != null && extractedAddress != null)
                break;
        }

        // 2) 다양한 CSS 선택자를 순차적으로 시도
        if (extractedCeo == null) {
            for (String selector : CEO_SELECTORS) {
                Element ceoEl = doc.selectFirst(selector);
                if (ceoEl != null && !ceoEl.text().isBlank()) {
                    String text = ceoEl.text().trim();
                    // CEO 이름으로 보이는 텍스트만 추출 (2~4글자)
                    if (text.length() >= 2 && text.length() <= 8) {
                        extractedCeo = text;
                        break;
                    }
                }
            }
        }
        if (extractedAddress == null) {
            for (String selector : ADDRESS_SELECTORS) {
                Element addrEl = doc.selectFirst(selector);
                if (addrEl != null && !addrEl.text().isBlank()) {
                    String text = addrEl.text().trim();
                    // 주소로 보이는 텍스트만 추출 (최소 길이 체크)
                    if (text.length() >= 10 && text.contains("시")) {
                        extractedAddress = text;
                        break;
                    }
                }
            }
        }

        // 3) 페이지 텍스트 휴리스틱: '대표이사', '대표' 등의 단어가 포함된 요소에서 이름 추출
        if (extractedCeo == null) {
            Elements reps = doc.getElementsContainingOwnText("대표이사");
            if (reps.isEmpty())
                reps = doc.getElementsContainingOwnText("대표");
            if (!reps.isEmpty()) {
                String txt = reps.first().text();
                String maybe = txt.replaceAll(".*대표이사[:\\s]*", "").replaceAll(".*대표[:\\s]*", "").trim();
                if (maybe.length() > 0 && maybe.length() < 60)
                    extractedCeo = maybe;
            }
        }

        // 4) footer 또는 연락처 영역 검색 보조
        if (extractedAddress == null) {
            for (String sel : FOOTER_SELECTORS) {
                Elements footers = doc.select(sel);
                for (Element f : footers) {
                    String t = f.text();
                    if (t.contains("주소") || t.contains("Location") || t.contains("Address")) {
                        String[] lines = t.split("\\n");
                        for (String line : lines) {
                            if (line.contains("주소") || line.toLowerCase().contains("address")) {
                                String maybe = line.replaceAll(".*주소[:：\\s]*", "").replaceAll(".*address[:\\s]*", "")
                                        .trim();
                                if (maybe.length() > 0 && maybe.length() < 200) {
                                    extractedAddress = maybe;
                                    break;
                                }
                            }
                        }
                    }
                    if (extractedAddress != null)
                        break;
                }
                if (extractedAddress != null)
                    break;
            }
        }
        // 추가 필드 추출: 타이틀, 로고, 사업자번호, 직원수, 업종 등
        String extractedTitle = null;
        String extractedLogo = null;
        String extractedBusinessNumber = null;
        String extractedEmployeeCount = null;
        String extractedIndustry = null;

        // title / og:title (OG_TITLE_SELECTORS 사용)
        Element titleEl = null;
        for (String sel : OG_TITLE_SELECTORS) {
            if ("title".equals(sel)) {
                // HTML title 태그는 doc.title()로 처리
                continue;
            }
            titleEl = doc.selectFirst(sel);
            if (titleEl != null)
                break;
        }
        if (titleEl != null)
            extractedTitle = titleEl.attr("content");
        if (extractedTitle == null || extractedTitle.isBlank())
            extractedTitle = doc.title();

        // og:image or json-ld logo (OG_IMAGE_SELECTORS 사용)
        for (String sel : OG_IMAGE_SELECTORS) {
            Element imgEl = doc.selectFirst(sel);
            if (imgEl != null) {
                extractedLogo = imgEl.attr("content");
                break;
            }
        }
        if (extractedLogo == null || extractedLogo.isBlank()) {
            // JSON-LD에서 logo 추출 시도
            for (Element jsonEl : jsonLdEls) {
                String json = jsonEl.html();
                try {
                    JSONObject jo = null;
                    try {
                        jo = new JSONObject(json);
                    } catch (Exception e) {
                        try {
                            JSONArray ja = new JSONArray(json);
                            if (ja.length() > 0 && ja.optJSONObject(0) != null)
                                jo = ja.optJSONObject(0);
                        } catch (Exception ignore) {
                        }
                    }
                    if (jo != null && jo.has("logo")) {
                        Object logoObj = jo.get("logo");
                        if (logoObj != null)
                            extractedLogo = logoObj.toString();
                    }
                } catch (Exception ex) {
                }
                if (extractedLogo != null && !extractedLogo.isBlank())
                    break;
            }
        }

        // 사업자번호: 문서 전체 텍스트에서 한국 사업자번호 패턴(예: 123-45-67890) 탐색
        String allText = doc.text();
        if (allText != null) {
            java.util.regex.Pattern p = java.util.regex.Pattern.compile("(\\d{3}-\\d{2}-\\d{5}|\\d{3}-\\d{3}-\\d{3})");
            java.util.regex.Matcher m = p.matcher(allText);
            if (m.find()) {
                extractedBusinessNumber = m.group(1);
            } else {
                // '사업자등록번호' 직접 검색
                java.util.regex.Pattern p2 = java.util.regex.Pattern.compile("사업자등록번호[:：\\s]*([0-9\\-]{8,15})");
                java.util.regex.Matcher m2 = p2.matcher(allText);
                if (m2.find())
                    extractedBusinessNumber = m2.group(1);
            }
        }

        // 직원수: '직원', '사원' 등 키워드 주변 숫자 추출
        if (extractedEmployeeCount == null && allText != null) {
            java.util.regex.Pattern p3 = java.util.regex.Pattern.compile("(직원|사원|employees|employees:)[:\\s]*([0-9,]+)",
                    java.util.regex.Pattern.CASE_INSENSITIVE);
            java.util.regex.Matcher m3 = p3.matcher(allText);
            if (m3.find())
                extractedEmployeeCount = m3.group(2).replaceAll(",", "");
            else {
                // 숫자+명 패턴
                java.util.regex.Pattern p4 = java.util.regex.Pattern.compile("([0-9,]{1,6})\\s*명");
                java.util.regex.Matcher m4 = p4.matcher(allText);
                if (m4.find())
                    extractedEmployeeCount = m4.group(1).replaceAll(",", "");
            }
        }

        // 업종: meta keywords 또는 페이지 텍스트에서 업종 관련 단어 추출 시도
        for (String sel : KEYWORDS_SELECTORS) {
            Element kw = doc.selectFirst(sel);
            if (kw != null && (extractedIndustry == null || extractedIndustry.isBlank())) {
                extractedIndustry = kw.attr("content");
                break;
            }
        }

        // 추가: 주요 제품, 근무환경, 연봉대 추출 시도
        String mainProducts = null;
        String workEnvironment = null;
        String salaryRange = null;
        for (String selector : MAIN_PRODUCTS_SELECTORS) {
            Element mpEl = doc.selectFirst(selector);
            if (mpEl != null && !mpEl.text().isBlank()) {
                mainProducts = mpEl.text().trim();
                break;
            }
        }
        // 근무환경 탐색
        java.util.regex.Pattern envP = java.util.regex.Pattern.compile("근무환경[:：\\s]*([^\\n]{2,200})");
        java.util.regex.Matcher envM = envP.matcher(allText == null ? "" : allText);
        if (envM.find())
            workEnvironment = envM.group(1).trim();
        // 연봉대 탐색
        java.util.regex.Pattern salP = java.util.regex.Pattern.compile("연봉[:：\\s]*([0-9,\\-~만원]+)");
        java.util.regex.Matcher salM = salP.matcher(allText == null ? "" : allText);
        if (salM.find())
            salaryRange = salM.group(1).trim();

        // 병합: DB의 값이 비어있으면 크롤링 값으로 채움
        boolean changed = false;
        if ((metaDesc != null && !metaDesc.isBlank())
                && (company.getCompanyCulture() == null || company.getCompanyCulture().isBlank())) {
            company.setCompanyCulture(metaDesc);
            changed = true;
        }
        if (aboutText != null && !aboutText.isBlank()
                && (company.getCompanyHistory() == null || company.getCompanyHistory().isBlank())) {
            company.setCompanyHistory(aboutText);
            changed = true;
        }
        if (businessAreas != null && !businessAreas.isBlank()
                && (company.getBusinessAreas() == null || company.getBusinessAreas().isBlank())) {
            company.setBusinessAreas(businessAreas);
            changed = true;
        }
        if (history != null && !history.isBlank()
                && (company.getCompanyHistory() == null || company.getCompanyHistory().isBlank())) {
            company.setCompanyHistory(
                    (company.getCompanyHistory() == null ? "" : company.getCompanyHistory() + "\n") + history);
            changed = true;
        }

        if (extractedCeo != null && !extractedCeo.isBlank()
                && (company.getCeoName() == null || company.getCeoName().isBlank())) {
            company.setCeoName(extractedCeo);
            changed = true;
        }
        if (extractedAddress != null && !extractedAddress.isBlank()
                && (company.getAddress() == null || company.getAddress().isBlank())) {
            company.setAddress(extractedAddress);
            changed = true;
        }
        if (extractedTitle != null && !extractedTitle.isBlank()
                && (company.getCompanyName() == null || company.getCompanyName().isBlank())) {
            company.setCompanyName(extractedTitle);
            changed = true;
        }
        if (extractedLogo != null && !extractedLogo.isBlank()
                && (company.getLogoUrl() == null || company.getLogoUrl().isBlank())) {
            company.setLogoUrl(extractedLogo);
            changed = true;
        }
        if (extractedBusinessNumber != null && !extractedBusinessNumber.isBlank()
                && (company.getBusinessNumber() == null || company.getBusinessNumber().isBlank())) {
            company.setBusinessNumber(extractedBusinessNumber);
            changed = true;
        }
        if (extractedEmployeeCount != null && !extractedEmployeeCount.isBlank()
                && (company.getEmployeeCount() == null || company.getEmployeeCount().isBlank())) {
            company.setEmployeeCount(extractedEmployeeCount);
            changed = true;
        }
        if (extractedIndustry != null && !extractedIndustry.isBlank()
                && (company.getIndustryCategory() == null || company.getIndustryCategory().isBlank())) {
            company.setIndustryCategory(extractedIndustry);
            changed = true;
        }
        if (mainProducts != null && !mainProducts.isBlank()
                && (company.getMainProducts() == null || company.getMainProducts().isBlank())) {
            company.setMainProducts(mainProducts);
            changed = true;
        }
        if (workEnvironment != null && !workEnvironment.isBlank()
                && (company.getWorkEnvironment() == null || company.getWorkEnvironment().isBlank())) {
            company.setWorkEnvironment(workEnvironment);
            changed = true;
        }
        if (salaryRange != null && !salaryRange.isBlank()
                && (company.getSalaryRange() == null || company.getSalaryRange().isBlank())) {
            company.setSalaryRange(salaryRange);
            changed = true;
        }

        // websiteUrl이 비어있었다가 새로 채워진 경우도 '변경'으로 간주하여 저장합니다.
        if (changed || websiteUrlWasEmpty) {
            company.setLastUpdated(LocalDateTime.now());
            companyRepository.save(company);

            if (websiteUrlWasEmpty && !changed) {
                log.info("Found and saved new website {} for company {}", company.getWebsiteUrl(),
                        company.getCompanyId());
            } else if (changed) {
                log.info("Updated company {} from site {}", company.getCompanyId(), successUrl);
            }
        } else {
            log.debug("No new data from {} for {}", successUrl, company.getCompanyId());
        }
    }
}
