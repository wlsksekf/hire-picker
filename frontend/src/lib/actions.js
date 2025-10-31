'use server'; // 이 파일의 모든 함수가 서버에서 실행됨을 명시

// 🚨 안정적인 임시 데이터 저장소 (서버 프로세스가 살아있는 동안 유지됩니다.)
const TEMP_POSTS_DATA = [
  { id: '1', title: '첫 번째 글입니다.', content: '상세 내용 1...', author: '홍길동', createdAt: '2025.10.01', views: 120 },
  { id: '2', title: '합격 후기 공유드립니다.', content: '상세 내용 2...', author: '행복취준생', createdAt: '2025.10.25', views: 321 },
  { id: '3', title: '면접 때 이 질문 꼭 나옵니다!', content: '상세 내용 3...', author: '김멘토', createdAt: '2025.10.26', views: 88 },
];
let nextId = 4; // 새 글 작성을 위한 ID 카운터

// --- 1. 게시글 데이터 가져오기 (데이터베이스 쿼리 역할) ---
export async function getPosts() {
    // 배열의 복사본을 반환하여 외부에서 원본 배열이 직접 수정되는 것을 방지합니다.
    return [...TEMP_POSTS_DATA];
}

export async function getPost(id) {
    return TEMP_POSTS_DATA.find(p => p.id === id);
}

// --- 2. 새 글 작성 (CREATE) ---
export async function createPost(title, content) {
    const newPost = {
        id: String(nextId++),
        title,
        content,
        author: '서버 액션 유저',
        createdAt: new Date().toLocaleDateString('ko-KR'),
        views: 0
    };
    TEMP_POSTS_DATA.push(newPost); // 배열 끝에 추가
    console.log('게시글 작성 완료:', newPost.id, TEMP_POSTS_DATA.length);
    return newPost.id;
}

// --- 3. 게시글 수정 (UPDATE) ---
export async function updatePost(postId, title, content) {
    const postIndex = TEMP_POSTS_DATA.findIndex(p => p.id === postId);
    
    if (postIndex !== -1) {
        TEMP_POSTS_DATA[postIndex].title = title;
        TEMP_POSTS_DATA[postIndex].content = content;
        console.log('게시글 수정 완료:', postId);
        return true;
    }
    return false;
}

// --- 4. 게시글 삭제 (DELETE) ---
export async function deletePost(postId) {
    const postIndex = TEMP_POSTS_DATA.findIndex(p => p.id === postId);
    
    if (postIndex !== -1) {
        TEMP_POSTS_DATA.splice(postIndex, 1); // 배열에서 해당 인덱스 항목 제거
        console.log('게시글 삭제 완료:', postId);
        return true;
    }
    return false; 
}
