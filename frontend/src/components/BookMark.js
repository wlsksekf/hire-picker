"use client";
import React, { useState, useEffect } from "react";
import { IconButton } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as solidStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as regularStar } from "@fortawesome/free-regular-svg-icons";
import axios from "axios";
import useAuthStore from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function Bookmark(props) {
  const { jobId } = props;
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const checkUrl = "/api/bookmark/check";
  const toggleUrl = "/api/bookmark/toggle";

  useEffect(() => {
    if (!isAuthenticated) {
      setIsBookmarked(false);
      return;
    }

    setIsLoading(true);
    axios
      .post(checkUrl, { jobId }, { withCredentials: true, timeout: 90000 })
      .then((res) => {
        if (res.data.LoggedIn) {
          setIsBookmarked(res.data.Bookmarked);
        } else {
          setIsBookmarked(false);
        }
      })
      .catch(() => {
        setIsBookmarked(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [jobId, isAuthenticated, checkUrl]);

  const handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (!isAuthenticated) {
      alert("로그인이 필요합니다.");
      router.push("/login");
      return;
    }

    if (isLoading) {
      return;
    }

    setIsLoading(true);
    axios
      .post(toggleUrl, { jobId }, { withCredentials: true })
      .then((res) => {
        if (res.data.success) {
          setIsBookmarked(res.data.Bookmarked);
          alert(res.data.message);
        } else {
          alert(res.data.message || "처리 중 오류가 발생했습니다.");
        }
      })
      .catch(() => {
        alert("북마크 처리에 실패했습니다.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <IconButton
      onClick={handleClick}
      color={isBookmarked ? "warning" : "default"}
      disabled={isLoading}
    >
      <FontAwesomeIcon icon={isBookmarked ? solidStar : regularStar} />
    </IconButton>
  );
}
