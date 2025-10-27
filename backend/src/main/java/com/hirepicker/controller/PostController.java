package com.hirepicker.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hirepicker.entity.Posts;
import com.hirepicker.result.ResultData;
import com.hirepicker.service.PostService;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RequestMapping("/api/posts")
@RestController
public class PostController {
    private final PostService postService;

@GetMapping("")
public ResultData<List<Posts>> getList() {
//Map<String, Object> map = new HashMap<>();
List<Posts> list = this.postService.getList();
//map.put("ar", list);
//map.put("length", list.size());
String msg = "fail";
if(list != null && list.size() > 0)
    msg = "success";

//return map;
return ResultData.of(list.size(), msg, list);
}
}
