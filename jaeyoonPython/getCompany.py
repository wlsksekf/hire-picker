import mysql.connector
from mysql.connector import errorcode
import requests

from dotenv import load_dotenv
import os

load_dotenv()
def getCompanyName():
    
    conn =None
    company_list=[]
    
    try:
        conn =mysql.connector.connect(
            user=os.getenv("DB_USERNAME"),
            password=os.getenv("DB_PASSWORD"),
            host=os.getenv("DB_URL"),
            port=os.getenv("DB_PORT"),
            database=os.getenv("DB_DATABASE")
        )
        cursor =conn.cursor()
        
        # SQL 쿼리 실행
        cursor.execute("SELECT company_name FROM company")
        
        # 결과 가져오기
        rows = cursor.fetchall()

        company_list =[]
        
        for row in rows:
            company_name=row[0]
        company_list.append(company_name)
    finally:
        if conn:
            conn.close()
    return company_list

#이미지 다운받기
def download_image(url, filename, headers):
   try:
       img_response = requests.get(url, headers=headers, stream=True)
       img_response.raise_for_status()

    
    
    
        
