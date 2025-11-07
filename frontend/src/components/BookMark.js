'use client';
import React, { useState, useEffect } from 'react';
import { IconButton } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as solidStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as regularStar } from '@fortawesome/free-regular-svg-icons';
import Cookies from 'js-cookie';
import axios from 'axios';

export default function Bookmark(props) {
  var jobId = props.jobId;
  var [isBookmarked, setIsBookmarked] = useState(false);
  var [isLoggedIn, setIsLoggedIn] = useState(false);

  const checkurl="/api/bookmark/check"

  // 로그인 여부 확인
  useEffect(function(){
    axios.post(checkurl,{jobId:jobId},{withCredentials:true, timeout:90000})
    .then(function(res){
      console.log(res.data)
      setIsLoggedIn(res.data.LoggedIn)
      setIsBookmarked(res.data.Bookmarked)
    }).catch(function(){
      setIsLoggedIn(false);
    });
  },[jobId])

  function handleClick(){
    if(!isLoggedIn){
      alert("로그인이 필요합니다")
    }
    return;
  }




    return (
    <IconButton onClick={handleClick} color={isBookmarked ? 'warning' : 'default'}>
      <FontAwesomeIcon icon={isBookmarked ? solidStar : regularStar} />
    </IconButton>
  );

}
