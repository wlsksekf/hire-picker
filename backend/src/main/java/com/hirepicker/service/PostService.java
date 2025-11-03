package com.hirepicker.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Sort;

import com.hirepicker.dto.PostListDto;
import com.hirepicker.entity.Posts;
import com.hirepicker.repository.PostRepository;

import lombok.RequiredArgsConstructor;
import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;

    private static final int PAGE_SIZE = 10;
    private static final Long DEFAULT_BOARD_ID = 1L;

    // 게시글 작성 (CREATE)
    @Transactional
    public Posts create(Long pUserIdx, String title, String content, MultipartFile imageFile) throws IOException {

        String imgName = null;
        String fileName = null;

        // 파일 처리
        if (imageFile != null && !imageFile.isEmpty()) {
            fileName = imageFile.getOriginalFilename();
            String fileExtension = fileName.substring(fileName.lastIndexOf("."));
            String uniqueFileName = UUID.randomUUID().toString() + fileExtension;
            imgName = "/uploads/images/" + uniqueFileName;
            // 실제 파일 저장 로직 필요
        }

        // 카멜케이스로 변경된 Posts 엔티티 생성
        Posts post = new Posts();
        post.setBoardIdx(DEFAULT_BOARD_ID);    // 필드명 변경!
        post.setPUserIdx(pUserIdx);            // 필드명 변경!
        post.setTitle(title);
        post.setContent(content);
        post.setFileName(fileName);            // 필드명 변경!
        post.setImgName(imgName);              // 필드명 변경!
        post.setViewCount(0);

        // createdAt, updatedAt은 JPA Auditing에서 자동 설정

        return postRepository.save(post);
    }

    // 게시글 목록 조회
   // 게시글 + 닉네임 DTO 반환용 서비스 메서드 신규 추가!
    public Page<PostListDto> getPostListWithNickname(String bname, int cPage) {
        Long boardIdx = DEFAULT_BOARD_ID; // bname->boardIdx 변환 코드(기존처럼)
        Pageable pageable = PageRequest.of(cPage - 1, PAGE_SIZE, Sort.by(Sort.Direction.DESC, "postIdx"));
        return postRepository.findPostListWithNickname(boardIdx, pageable); // 변경된 Repository 쿼리!
    }

public PostListDto getPostDetailWithNickname(Long postIdx) {
    return postRepository.findPostDetailWithNickname(postIdx)
        .orElse(null);
}

}
