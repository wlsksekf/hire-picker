package com.hirepicker.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.hirepicker.entity.Posts;
import com.hirepicker.repository.PostRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepository postRepository;
    
    public List<Posts> getList(){
        return postRepository.findAll();
    }
}
