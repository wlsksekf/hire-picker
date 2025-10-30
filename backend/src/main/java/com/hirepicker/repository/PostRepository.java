package com.hirepicker.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hirepicker.entity.Posts;

@Repository
public interface PostRepository extends JpaRepository<Posts, Long>{

}

