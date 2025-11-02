package com.hirepicker.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Sort; // ⭐ 추가 필요
import com.hirepicker.entity.Posts;
import com.hirepicker.repository.PostRepository;

import lombok.RequiredArgsConstructor;
import java.io.IOException;
import java.util.UUID; // 고유 파일명 생성을 위해 사용

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    
    private static final int PAGE_SIZE = 10;
    private static final Long DEFAULT_BOARD_ID = 1L; // 기본 게시판 ID 가정

    // ==========================================================
    // ⭐ 게시글 작성 (CREATE) 메서드: 컬럼 매핑 로직 포함
    // ==========================================================
    @Transactional
    public Posts create(String pUserIdx, String title, String content, MultipartFile imageFile) throws IOException {
        
        String imgName = null; // 서버에 저장될 고유 파일명 또는 경로
        String fileName = null; // 사용자가 업로드한 원본 파일명

        // 1. 파일 처리 로직
        if (imageFile != null && !imageFile.isEmpty()) {
            
            // 1-1. 원본 파일명 설정 (file_name 컬럼)
            fileName = imageFile.getOriginalFilename();
            
            // 1-2. 고유 파일명 생성 및 경로 설정 (img_name 컬럼)
            // 실제 환경에서는 이 고유명을 사용하여 S3 등에 파일을 저장합니다.
            String fileExtension = fileName.substring(fileName.lastIndexOf("."));
            String uniqueFileName = UUID.randomUUID().toString() + fileExtension;
            
            // 임시 URL/경로 설정 (실제 저장 경로로 대체해야 합니다.)
            imgName = "/uploads/images/" + uniqueFileName;
            
            // TODO: 여기에 실제 파일 저장 (예: S3 또는 로컬 파일 시스템) 로직을 구현해야 합니다.
            // if (imageFile.getSize() > MAX_SIZE) throw new IOException("File size exceeds limit.");
            // imageFile.transferTo(new File(ACTUAL_SAVE_PATH + uniqueFileName));
        }

        // 2. Posts 엔티티 생성 및 필수 컬럼 값 설정
        Posts post = new Posts();
        
        // 필수 필드 설정
        post.setBoardIdx(DEFAULT_BOARD_ID); // 기본 게시판 ID (1L) 설정
        post.setP_user_idx(pUserIdx);         // 인증된 사용자 ID 설정
        post.setTitle(title);
        post.setContent(content);
        
        // 이미지 관련 필드 설정 (파일이 없으면 null)
        post.setFile_name(fileName);         // 원본 파일명
        post.setImg_name(imgName);           // 서버 파일 경로/URL
        
        // 기본값 설정
        post.setView_count(0);
        // created_at, updated_at은 JPA의 @CreatedDate, @LastModifiedDate에 의존하거나 DB에서 자동 설정될 것으로 가정합니다.

        // 3. Repository를 통해 DB에 저장
        return postRepository.save(post);
    }


    // ==========================================================
    // 기존 메서드 (유지)
    // ==========================================================
    public Page<Posts> getList(String bname, int cPage){
        // 1. 게시판 이름(bname)을 ID(boardIdx)로 매핑(임시로직)
        Long boardIdx = DEFAULT_BOARD_ID; //현재는 모두 1L로 가정(Posts엔티티에 1L로 저장됨)
        // TODO: 실제 환경에서는 게시판 정보를 DB에서 조회하여 board_idx를 결정해야 합니다.
        if("BBS".equalsIgnoreCase(bname)){
            boardIdx = 1L;
        } else if("NOTICE".equalsIgnoreCase(bname)){
            // boardIdx = 2L; // 다른 게시판이 있다면 이와 같이 처리
        }
        // 2. 페이징 및 정렬 설정
        // Sort.by(Sort.Direction.DESC, "post_idx"):
        Sort sort = Sort.by(Sort.Direction.DESC, "created_at");
        
        //Pageable 객체 생성: 페이지 번호(cPage-1), 페이지 크기(PAGE_SIZE), 정렬(sort)
        Pageable pageable = PageRequest.of(cPage - 1, PAGE_SIZE, sort);

        // 3. Repository 호출(board_idx로 필터링 및 페이지/정렬 적용)
        return postRepository.findByBoardIdx(boardIdx, pageable);
        
    }
    
    public Posts getPost(Long postIdx){
        return postRepository.findById(postIdx).orElse(null);
    }
}