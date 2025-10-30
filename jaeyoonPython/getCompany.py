import mysql.connector
from mysql.connector import errorcode
import requests

from dotenv import load_dotenv
import os
import time
import logging

# Selenium 관련 import
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from selenium.common.exceptions import TimeoutException

load_dotenv()

# ⬇️ [수정됨] 쿼리가 'job_posting' 테이블과 JOIN 하도록 변경
def getCompanyName(conn):
    """
    job_posting 테이블에서 참조하는 company의 이름 목록을 가져옵니다.
    """
    company_list = []
    cursor = None
    
    try:
        cursor = conn.cursor()
        
        # ⭐️ [수정됨] job_posting과 company를 JOIN하여
        # job_posting에 등록된 회사의 이름만 '중복 없이' 가져옵니다.
        query = """
        SELECT DISTINCT c.company_name 
        FROM company c
        JOIN job_posting jp ON c.company_idx = jp.company_idx
        """
        
        cursor.execute(query)
        rows = cursor.fetchall()

        for row in rows:
            company_name = row[0]
            company_list.append(company_name)
    
    except Exception as e:
        print(f"DB 오류 (getCompanyName): {e}")
    finally:
        if cursor:
            cursor.close()
            
    return company_list

# ⬇️ [⭐️⭐️⭐️ 이 함수가 빠져서 오류가 났습니다 ⭐️⭐️⭐️]
def download_image(url, filename, headers):
    """
    URL(http...)로 부터 이미지를 다운로드합니다.
    """
    try:
        img_response = requests.get(url, headers=headers, stream=True)
        img_response.raise_for_status()
        os.makedirs(os.path.dirname(filename), exist_ok=True)

        with open(filename, "wb") as f:
            for chunk in img_response.iter_content(8192):
                f.write(chunk)
        print(f"-> {filename} 저장완료")
        return filename
    except Exception as e:
        print(f"->이미지 다운 실패 {e}")
        return None

# ⬇️ [최종 수정] 'gstatic' 대기 시간을 10초로 늘림
def find_logo_from_google(driver, companyName):
    
    print(f"\n[{companyName}] Selenium으로 이미지 검색 시작")
    
    search_query = f"{companyName} 본사 건물" 
    search_url = f"https://www.google.com/search?q={search_query}&tbm=isch"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

    try:
        driver.get(search_url)
        wait = WebDriverWait(driver, 10) # (페이지 로딩 10초 대기)
        
        # 1. 썸네일 클릭 (크기 비교 로직)
        try:
            print(f"[{companyName}] 모든 썸네일(img.YQ4gaf)이 로드되기를 대기 중...")
            thumbnails = wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, "img.YQ4gaf")))
            
            if len(thumbnails) == 0:
                print(f"[{companyName}] 썸네일(img.YQ4gaf)을 하나도 찾지 못했습니다.")
                return None
            
            first_real_thumbnail = None
            print(f"[{companyName}] 총 {len(thumbnails)}개의 썸네일 중 '진짜' 썸네일(높이>100px) 탐색...")
            
            for thumbnail in thumbnails:
                height = thumbnail.size['height']
                if height > 100:
                    print(f"[{companyName}] 진짜 썸네일 찾음! (높이: {height}px)")
                    first_real_thumbnail = thumbnail
                    break 
            
            if not first_real_thumbnail:
                print(f"[{companyName}] 100px 이상 크기의 진짜 썸네일을 찾지 못했습니다.")
                return None

        except TimeoutException:
            print(f"[{companyName}] 썸네일 이미지를 로드하지 못했습니다 (Timeout).")
            return None 

        try:
            driver.execute_script("arguments[0].click();", first_real_thumbnail)
            print(f"[{companyName}] '진짜 썸네일' 강제 클릭 (JS Click)")
        except Exception as click_err:
            print(f"[{companyName}] JS 강제 클릭 실패: {click_err}")
            return None


        # 2. 고해상도 이미지 URL 가져오기 ('gstatic' 10초 대기)
        img_url = "" 
        try:
            print(f"[{companyName}] 고해상도 이미지(img.sFlh5c) 로딩 대기 중...")
            
            large_image_element = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "img.sFlh5c")))
            
            print(f"[{companyName}] ...'src'가 'gstatic'이 아닌 http URL이 될 때까지 10초간 대기...")
            
            real_url_found = False
            start_time = time.time()

            while time.time() - start_time < 10: # (10초 대기)
                img_url = large_image_element.get_attribute('src')
                
                if img_url and img_url.startswith('http') and 'gstatic.com' not in img_url:
                    print(f"[{companyName}] 고해상도 'http' (non-gstatic) URL 확보!")
                    real_url_found = True
                    break
                
                time.sleep(0.2) 
            
            if not real_url_found:
                print(f"[{companyName}] 10초 내 'non-gstatic' URL을 못찾음.")
                if img_url and img_url.startswith('http'):
                    print(f"[{companyName}] ...차선책으로 현재 'gstatic' 썸네일 URL을 사용합니다.")
                else:
                    print(f"[{companyName}] 10초 후에도 유효한 http URL을 찾지 못했습니다.")
                    return None 

        except TimeoutException:
            print(f"[{companyName}] 고해상도 이미지(img.sFlh5c) 자체를 찾지 못했습니다 (Timeout).")
            return None 

        # 3. URL 유효성 검사
        if not img_url:
            print(f"[{companyName}] 이미지의 src 속성을 찾지 못했습니다.")
            return None

        # 4. 파일명 처리
        safe_fileName = "".join([c for c in companyName if c.isalnum() or c in (' ', '_')]).rstrip()
        fileName = f"company_images/{safe_fileName}.png"

        # 5. http만 저장
        if img_url.startswith('http'):
            print(f"[{companyName}] 고해상도 URL 찾음: {img_url[:50]}...")
            return download_image(img_url, fileName, headers)
        else:
            print(f"[{companyName}] http가 아닌 URL({img_url[:30]}...)이므로 건너뜁니다.")
            return None

    except Exception as e:
        print(f"[{companyName}] Selenium 크롤링 중 알 수 없는 오류: {e}")
        return None


# --- [수정됨] '전체 실행 모드' + 'headless' 활성화 ---
if __name__ == "__main__":
    
    # Selenium 로그 숨기기
    logging.getLogger('selenium').setLevel(logging.WARNING)
    logging.getLogger('urllib3').setLevel(logging.WARNING)
    
    conn = None
    cursor = None
    driver = None  
    companies = []
    
    try:
        # 1. Selenium 드라이버 설정 (봇 탐지 우회 옵션 포함)
        print("--- Selenium Chrome 드라이버를 시작합니다... (headless) ---")
        service = Service(ChromeDriverManager().install())
        options = webdriver.ChromeOptions()
        
        # ⭐️ 창이 뜨지 않도록 'headless' 옵션을 다시 켰습니다.
        options.add_argument("--headless") 
        
        options.add_argument("--log-level=3") 
        options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
        options.add_argument("--disable-blink-features=AutomationControlled")
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option('useAutomationExtension', False)
        
        driver = webdriver.Chrome(service=service, options=options)
        print("--- Selenium 드라이버 시작 완료 (탐지 우회 모드) ---")

        # 2. DB 연결
        conn = mysql.connector.connect(
            user=os.getenv("DB_USERNAME"),
            password=os.getenv("DB_PASSWORD"),
            host=os.getenv("DB_URL"), 
            port=os.getenv("DB_PORT"),
            database=os.getenv("DB_DATABASE")
        )
        print("--- DB 연결 성공 (읽기/쓰기) ---")

        # 3. DB에서 'job_posting'에 있는 회사 목록 가져오기
        companies = getCompanyName(conn)
        
        if not companies:
            print("DB(job_posting)에서 가져올 회사 목록이 없습니다. 스크립트를 종료합니다.")
        else:
            print(f"\n--- DB(job_posting)에서 총 {len(companies)}개 회사 목록 가져오기 성공 ---")
            
            cursor = conn.cursor() # 업데이트용 커서 준비

            # --- ⬇️ '전체 실행' 모드 ---
            
            print("\n--- [전체 실행 모드] 모든 회사 크롤링을 시작합니다. ---")
            for company in companies:
                saved_path = find_logo_from_google(driver, company) 
                
                if saved_path:
                    print(f"[{company}] 이미지 저장 성공: {saved_path}")
                    try:
                        update_query = "UPDATE company SET image_path = %s WHERE company_name = %s"
                        cursor.execute(update_query, (saved_path, company))
                        print(f"[{company}] DB 업데이트 쿼리 실행")
                    except Exception as db_err:
                        print(f"[{company}] DB 업데이트 실패: {db_err}")
                
                # ⭐️ IP 차단 방지를 위해 매우 중요
                sleep_time = 3 
                print(f"--- Google IP 차단 방지를 위해 {sleep_time}초 대기... ---")
                time.sleep(sleep_time) 
            
            # 5. [전체 실행 모드] 모든 작업 완료 후 커밋
            conn.commit()
            print("\n--- [전체 실행 모드] 모든 DB 변경사항이 커밋되었습니다. ---")

    except mysql.connector.Error as err:
        if err.errno == 1040:
             print("🚨 [오류] DB 연결이 너무 많습니다 (Too many connections).")
        else:
             print(f"DB 연결 중 오류 발생: {err}")
    except Exception as e:
        print(f"DB 작업 중 알 수 없는 오류 발생: {e}")
    finally:
        # 6. 종료
        if driver:
            driver.quit()
            print("--- Selenium 드라이버가 종료되었습니다. ---")
        if cursor:
            cursor.close()
        if conn:
            conn.close()
            print("--- DB 연결이 종료되었습니다. ---")
    
    print("\n--- 모든 크롤링 작업 완료 ---")