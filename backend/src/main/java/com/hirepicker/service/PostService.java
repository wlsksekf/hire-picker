package com.hirepicker.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.hirepicker.entity.Posts;
import com.hirepicker.repository.PostRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    
    private static final int PAGE_SIZE = 10;
     // 페이지당 게시글 수 (프론트엔드와 일치해야 함)
    
    public Page<Posts> getList(String bname, int cPage){
        // 1. Pageable 객체 생성
        // cPage는 사용자에게는 1부터 시작하지만, PageRequest는 0부터 시작하므로 cPage - 1을 사용합니다.
        Pageable pageable = PageRequest.of(cPage - 1, PAGE_SIZE);
        
        // 2. Repository 메서드 호출 (board_idx로 필터링하는 메서드가 필요)
        // bname을 사용하려면 게시판 이름(bname)으로 게시판 ID(board_idx)를 찾는 로직이 선행되어야 합니다.
        // 여기서는 board_idx=1로 가정하고 findAll 메서드에 Pageable만 넘깁니다.
        // 실제로는 postRepository.findByBoardIdx(1, pageable) 와 같이 구현됩니다.
        
        // 현재는 findAll에 Pageable만 적용하여 전체 목록 중 해당 페이지만 가져옵니다.
        return postRepository.findAll(pageable);
    }
    public Posts getPost(Long postIdx){
        // PostRepository가 JpaRepository를 상속받았다면, findById메서드가 있습니다.
        // .orElse(null)을 사용하여 데이터가 없을 경우 null을 반환하도록 처리합니다.
        return postRepository.findById(postIdx).orElse(null);
        

    }
}