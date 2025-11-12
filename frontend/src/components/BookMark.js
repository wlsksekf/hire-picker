'use client';
import React, { useState, useEffect } from 'react';
import { IconButton } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as solidStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as regularStar } from '@fortawesome/free-regular-svg-icons';
import Cookies from 'js-cookie';
import axios from 'axios';
import { amET } from 'node_modules/@mui/material/locale';

export default function Bookmark(props) {
  var jobId = props.jobId;
  var [isBookmarked, setIsBookmarked] = useState(false);
  var [isLoggedIn, setIsLoggedIn] = useState(false);
  var [isLoading, setIsLoading] = useState(false); // API 요청 중 상태

  const checkurl="/api/bookmark/check"
  const toggleurl="/api/bookmark/toggle"

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
      return;
    }

    if (isLoading) {
      return;
    }

     // 3. 로그인 된 경우: 토글 로직 실행
    setIsLoading(true);

  axios.post(toggleurl, { jobId: jobId }, { withCredentials: true })
      .then(function (res) {
        // 백엔드로부터 받은 최신 상태로 UI 업데이트
        if(res.data.Bookmarked){
        setIsBookmarked(res.data.Bookmarked);
        alert("즐겨찾기 등록되었습니다다.")
      }
        else{
        setIsBookmarked(res.data.Bookmarked);
        alert("즐겨찾기 해제 되었습니다.")}


      })
      .catch(function (error) {
        alert("북마크 처리에 실패했습니다다..");
      })
      .finally(function () {
        setIsLoading(false); // 로딩 종료 (성공/실패 여부와 관계없이)
      });

  }





    return (
    <IconButton onClick={handleClick} color={isBookmarked ? 'warning' : 'default'}>
      <FontAwesomeIcon icon={isBookmarked ? solidStar : regularStar} />
    </IconButton>
  );

}
