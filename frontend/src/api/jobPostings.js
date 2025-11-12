// frontend/src/api/jobPostings.js
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'; // 백엔드 API 기본 URL

export const getAllJobPostings = async (page = 0, size = 10, sort = 'regDate,desc') => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/job-postings/all`, {
      params: { page, size, sort },
      withCredentials: true, // 인증 정보 (쿠키 등) 전송
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching all job postings:', error);
    throw error;
  }
};
