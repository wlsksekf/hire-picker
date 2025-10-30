// package com.hirepicker.controller;

// import java.security.Principal; // Principal 객체 사용을 위한 import 추가
// import java.util.List;

// import org.springframework.web.bind.annotation.GetMapping;
// import org.springframework.web.bind.annotation.PathVariable;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RequestParam;
// import org.springframework.web.bind.annotation.RestController;
// import org.springframework.web.multipart.MultipartFile; // 파일 처리를 위한 import 추가
// import org.springframework.web.bind.annotation.RequestPart; // RequestPart 사용을 위한 import 추가

// import org.springframework.data.domain.Page;

// import com.hirepicker.entity.Posts;
// import com.hirepicker.result.ResultData;
// import com.hirepicker.service.PostService;

// import lombok.RequiredArgsConstructor;
// import org.springframework.web.bind.annotation.PostMapping;
// import org.springframework.http.ResponseEntity; // ResponseEntity 사용을 위한 import (선택적이지만 일반적으로 사용)

// // @RequestBody는 FormData 처리 시 사용하지 않으므로 제거하거나 주석 처리합니다.
// // import org.springframework.web.bind.annotation.RequestBody;


// @RequiredArgsConstructor
// @RequestMapping("/api/posts")
// @RestController
// public class PostController {
//     private final PostService postService;

//     // ==========================================================
//     // ⭐ 게시글 작성 (POST) 메서드 추가: /api/posts/write
//     // ==========================================================
//     @PostMapping("/write")
//     public ResultData<?> writePost(
//         // 프론트에서 보낸 FormData의 필드명('title', 'content')과 일치해야 합니다.
//         @RequestParam("title") String title,
//         @RequestParam("content") String content,
        
//         // 프론트에서 보낸 파일 필드명('image')과 일치해야 합니다.
//         // 파일은 RequestPart로 받으며, 파일이 없을 수도 있으므로 required = false 설정
//         @RequestPart(value = "image", required = false) MultipartFile imageFile,
        
//         // HttpOnly 쿠키로 인증된 사용자 정보를 가져옵니다. (사용자 ID 추출에 사용)
//         Principal principal
//     ) {
//         // 1. 사용자 ID 추출 (인증 성공 가정)
//         // JWT 내부의 사용자 이름(Username) 또는 ID가 Principal 객체로 들어옵니다.
//         if (principal == null) {
//             // 이 코드가 실행되면 SecurityConfig에 문제가 있는 것이므로 401을 반환하는 것이 맞습니다.
//             // 클라이언트가 500을 받았으므로 일단 200으로 가정하고 진행합니다.
//             return ResultData.of(0, "Authentication required", null);
//         }
//         String username = principal.getName();
        
//         // 2. 서비스 호출 및 Posts 객체 저장
//         Posts newPost;
//         try {
//             // Service 계층으로 데이터를 전달하여 저장 로직을 수행합니다.
//             newPost = this.postService.create(username, title, content, imageFile);
            
//         } catch (Exception e) {
//             // 파일을 저장하거나 DB에 저장하는 중 오류 발생 시 500 에러를 반환합니다.
//             e.printStackTrace(); // 서버 로그에 스택 트레이스 출력
//             return ResultData.of(0, "Error during post creation: " + e.getMessage(), null);
//         }

//         // 3. 성공 응답
//         return ResultData.of(1, "Post created successfully", newPost);
//     }
    
//     // ==========================================================
//     // 기존 GET 메서드
//     // ==========================================================

//     @GetMapping("")
//     public ResultData<?> getList(@RequestParam(value = "bname", defaultValue = "BBS") String bname,
//                                  @RequestParam(value = "cPage", defaultValue = "1") int cPage){
        
//         // 수정: 서비스로부터 Page 객체를 받습니다.
//         Page<Posts> postPage = this.postService.getList(bname, cPage);

//         // 1. 실제 게시글 목록 (현재 페이지 10개)
//         List<Posts> list = postPage.getContent();
        
//         // 2. 전체 게시글 수 (프론트엔드에서 totalPage 계산에 사용)
//         long totalCount = postPage.getTotalElements(); // Long 타입입니다.

//         String msg = "fail";
//         if(list != null && !list.isEmpty())
//             msg = "success";

//         // 수정: 전체 개수(totalCount)와 목록(list)을 함께 반환
//         // ResultData의 첫 번째 인자(count)를 totalCount로 사용합니다.
//         return ResultData.of((int)totalCount, msg, list);
//     }

//     @GetMapping("/{post_idx}")
//     public ResultData<Posts> getPost(@PathVariable("post_idx") Long postIdx) {

//         Posts post = this.postService.getPost(postIdx);
        
//         String msg = (post != null) ? "success" : "fail";

//         // 상세 조회는 항목이 하나이므로 count를 1또는 0으로 처리합니다.
//         return ResultData.of((post != null ? 1 : 0), msg, post);
//     }

// }