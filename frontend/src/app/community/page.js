'use client';

import axios from "axios";
import { useEffect, useState } from "react";
import PostList from "./_components/PostList";


export default function Page() {

    const api_url = "/api/posts";

    const [bname, setBname] = useState('BBS')

    //스프링서버에서 전달되는 JSON배열을 저장할 곳!
    const [list, setList] = useState([]);
    const [cPage, setcPage] = useState(1);//현재페이지
    const [totalPage, setTotalPage] = useState(0);

    //비동기식 통신을 수행하는 함수
    function callData(){
        axios.get(
            api_url,
            {
                params:{bname:bname, cPage:cPage}
            }
        ).then(function(json){
            setList(json.data.data);
            
            const totalCount = json.data.totalCount || 0;
            const itemPerPage = 10;
            const calculatedTotalPage = Math.ceil(totalCount / itemPerPage);
            setTotalPage(calculatedTotalPage);
            //에러 핸들링 추가: 통신 실패 시 오류를 확인하기 용이
        }).catch(error => {
            console.error("데이터 통신 중 오류 발생:", error);
        });
    }
    useEffect(function(){
        callData();
    },[cPage]);

    function changePage(e, p){
        setcPage(p);
    }
    return(
        <div style={{width: '90%', margin: 'auto', padding: '20px'}}>
            <PostList ar={list} tp={totalPage} cp={changePage}/>
        </div>
    );
};