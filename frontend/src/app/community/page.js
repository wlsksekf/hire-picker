'use client';

import axios from "axios";
import { useEffect, useState } from "react";
import PostList from "./_components/PostList";

export default function Page() {
    const api_url = "/api/posts";

    const [bname, setBname] = useState('BBS');
    const [list, setList] = useState([]);
    const [cPage, setcPage] = useState(1);
    const [totalPage, setTotalPage] = useState(0);

    // 비동기식 통신 함수
    function callData(){
        axios.get(
            api_url,
            { params: { bname: bname, cPage: cPage } }
        ).then(function(json){
            // 백엔드에서 반환하는 구조: data 안에 정보가 다 들어감
            const data = json.data.data;
            setList(data.list || []);              // 게시글 목록
            setTotalPage(data.totalPages || 0);    // 전체 페이지 수
            setcPage(data.cPage || 1);             // 현재 페이지 (혹시 잘못 갱신될 경우 대비)
        }).catch(error => {
            console.error("데이터 통신 중 오류 발생:", error);
        });
    }

    useEffect(function() {
        callData();
        // eslint-disable-next-line
    }, [cPage]);

    function changePage(e, p) {
        setcPage(p);
    }

    return (
        <div style={{ width: '90%', margin: 'auto', padding: '20px' }}>
            <PostList ar={list} tp={totalPage} cp={changePage} currentPage={cPage}/>
        </div>
    );
};
