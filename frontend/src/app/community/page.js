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
            setList(json.data.ar);
            setTotalPage(json.data.totalPage);
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