// frontend/src/app/credit/page.js
"use client";

import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { getCreditProducts, getMarketplaceResumes, purchaseResume, api } from "@/api";
import CreditProductCard from "@/components/CreditProductCard";
import ClawToggle from "@/components/ClawToggle";
import ClawButton from "@/components/ClawButton";
import { useRouter } from "next/navigation";
import CreditCoinIcon from "@/components/CreditCoinIcon";
import theme from "@/theme/theme";
import { mixRgb, toRgbString, withAlpha } from "@/utils/color";
import { CircularProgress } from "@mui/material";
import useAuthStore from "@/store/authStore";

const PRIMARY = theme.colorSchemes.light.palette.primary.main;
const PRIMARY_DARK = theme.colorSchemes.light.palette.primary.dark;
const PRIMARY_RGB = toRgbString(PRIMARY);
const PRIMARY_DARK_RGB = toRgbString(PRIMARY_DARK);
const SECONDARY_TEXT = mixRgb(PRIMARY_RGB, "#000000", 0.2);
const BORDER_TINT = mixRgb(PRIMARY_RGB, "#ffffff", 0.25);
const BOX_SHADOW = withAlpha(PRIMARY_RGB, 0.18);

const STATUS_LOOKUP = {
  "3": "최종합격",
  "2": "면접합격",
  "1": "서류합격",
  "0": "지원중",
  "4": "서류탈락",
};
const STATUS_ORDER = ["3", "2", "1", "0", "4"];

const StoreContainer = styled.div`
  min-height: 100vh;
  background: #ffffff;
  padding: 72px 24px 108px;
  display: flex;
  justify-content: center;
`;

const ContentWrapper = styled.div`
  width: min(1080px, 100%);
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const HeaderSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;

  h1 {
    margin: 0;
    font-size: clamp(2rem, 4vw, 2.6rem);
    font-weight: 800;
    color: ${PRIMARY};
  }

  p {
    margin: 0;
    font-size: 1rem;
    color: ${SECONDARY_TEXT};
  }
`;

const BalanceBadge = styled.div`
  align-self: flex-start;
  padding: 12px 20px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid ${BORDER_TINT};
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 14px 24px ${BOX_SHADOW};

  span {
    font-size: 0.88rem;
    color: ${SECONDARY_TEXT};
  }

  strong {
    font-size: 1.08rem;
    color: ${PRIMARY_DARK_RGB};
  }
`;

const TabBar = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const TabButton = styled.button`
  border: none;
  border-radius: 999px;
  padding: 10px 20px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  background: ${({ $active }) => ($active ? PRIMARY : "#f1f5f9")};
  color: ${({ $active }) => ($active ? "#ffffff" : "#475569")};
  box-shadow: ${({ $active }) => ($active ? "0 10px 24px rgba(14,116,144,0.25)" : "none")};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ $active }) => ($active ? PRIMARY_DARK : "#e2e8f0")};
  }
`;

const FeedbackBar = styled.div`
  border-radius: 16px;
  padding: 14px 18px;
  background: ${({ $type }) => ($type === "error" ? "#fee2e2" : "#ecfdf5")};
  color: ${({ $type }) => ($type === "error" ? "#b91c1c" : "#047857")};
  border: 1px solid ${({ $type }) => ($type === "error" ? "rgba(248,113,113,0.6)" : "rgba(45,212,191,0.5)")};
  font-weight: 600;
`;

const CardSection = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 12px;
  justify-items: center;
`;

const ControlSection = styled.section`
  position: relative;
  margin-top: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  z-index: 2;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 50px;
`;

const MarketplaceSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const LoadingPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 80px 0;
  color: #64748b;
  font-weight: 600;
`;

const EmptyMarket = styled.div`
  border: 1px dashed ${BORDER_TINT};
  border-radius: 24px;
  padding: 64px 24px;
  text-align: center;
  background: #ffffff;
  color: #475569;

  h3 {
    margin: 0 0 12px;
    font-size: 1.25rem;
    font-weight: 700;
    color: #0f172a;
  }

  p {
    margin: 0;
    font-size: 0.95rem;
  }
`;

const ResumeMarketGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 18px;
`;

const MarketCard = styled.article`
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid ${BORDER_TINT};
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MarketHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
`;

const OwnerLine = styled.span`
  font-size: 0.86rem;
  color: #475569;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  background: rgba(56, 189, 248, 0.15);
  color: ${PRIMARY};
`;

const StatusList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const StatusChip = styled.span`
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: #f1f5f9;
  color: #1f2937;
`;

const SummaryText = styled.p`
  margin: 0;
  color: #475569;
  font-size: 0.92rem;
  line-height: 1.55;
  word-break: keep-all;
`;

const MarketMeta = styled.div`
  font-size: 0.78rem;
  color: #94a3b8;
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`;

const PriceInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const PriceLabel = styled.span`
  font-size: 0.75rem;
  color: #64748b;
`;

const PriceTag = styled.span`
  font-size: 1.15rem;
  font-weight: 800;
  color: ${PRIMARY_DARK};
`;

const PurchaseButton = styled.button`
  border: none;
  border-radius: 12px;
  padding: 10px 18px;
  font-weight: 700;
  font-size: 0.92rem;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  background: ${({ disabled, $purchased }) =>
    disabled ? "#e2e8f0" : $purchased ? "#0ea5e9" : PRIMARY};
  color: ${({ disabled }) => (disabled ? "#94a3b8" : "#ffffff")};
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: ${({ disabled }) => (disabled ? "none" : "translateY(-1px)")};
    box-shadow: ${({ disabled }) => (disabled ? "none" : "0 12px 26px rgba(14,116,144,0.2)")};
  }
`;

const CreditPage = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [balance, setBalance] = useState(0);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [activeTab, setActiveTab] = useState("store");
  const [marketResumes, setMarketResumes] = useState([]);
  const [marketLoading, setMarketLoading] = useState(false);
  const [purchaseLoadingId, setPurchaseLoadingId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const user = useAuthStore((state) => state.user);
  const userTypeRaw = user?.userType || user?.user_type || "";
  const isPersonal = typeof userTypeRaw === "string" && userTypeRaw.toUpperCase() === "PERSONAL";
  const isCompany = typeof userTypeRaw === "string" && userTypeRaw.toUpperCase() === "COMPANY";
  
  // 회사회원용 광고 공고 상태
  const [myJobPostings, setMyJobPostings] = useState([]);
  const [advertisedPostingIds, setAdvertisedPostingIds] = useState(new Set());
  const [adLoading, setAdLoading] = useState(false);

  useEffect(() => {
    getCreditProducts()
      .then((res) => {
        setProducts(res.products || []);
        setBalance(res.balance || 0);
      })
      .catch((err) => {
        console.error("크레딧 상품을 불러오는 중 오류", err);
        setFeedback({ type: "error", message: "크레딧 상품을 불러오지 못했습니다." });
      });
  }, []);

  const loadMarketplace = () => {
    if (!isPersonal) {
      setMarketResumes([]);
      return;
    }
    setMarketLoading(true);
    getMarketplaceResumes()
      .then((resumes) => {
        setMarketResumes(Array.isArray(resumes) ? resumes : []);
      })
      .catch((err) => {
        console.error("이력서 거래 정보를 불러오는 중 오류", err);
        setFeedback({ type: "error", message: "이력서 거래 정보를 불러오지 못했습니다." });
      })
      .finally(() => setMarketLoading(false));
  };

  const loadMyJobPostings = async () => {
    if (!isCompany) {
      setMyJobPostings([]);
      return;
    }
    setAdLoading(true);
    try {
      // 내 채용공고 목록 가져오기
      const jobPostingsRes = await api.get("/api/companies/my/job-postings");
      console.log("=== 채용공고 API 응답 ===", jobPostingsRes.data);
      console.log("첫 번째 공고:", jobPostingsRes.data[0]);
      setMyJobPostings(jobPostingsRes.data || []);

      // 활성 광고 목록 가져오기 (광고로 등록된 공고 ID 수집)
      const activeAdsRes = await api.get("/api/ad-postings/active");
      console.log("=== 광고 공고 API 응답 ===", activeAdsRes.data);
      const advertisedIds = new Set(
        (activeAdsRes.data || []).map(ad => ad.jobPosting?.postingIdx).filter(Boolean)
      );
      console.log("광고 중인 공고 ID들:", Array.from(advertisedIds));
      setAdvertisedPostingIds(advertisedIds);
    } catch (err) {
      console.error("채용공고 목록을 불러오는 중 오류", err);
      setFeedback({ type: "error", message: "채용공고 목록을 불러오지 못했습니다." });
    } finally {
      setAdLoading(false);
    }
  };

  useEffect(() => {
    loadMarketplace();
    loadMyJobPostings();
  }, [isPersonal, isCompany]);

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(timer);
  }, [feedback]);

  const handleTabChange = (key) => {
    if (key === "market" && !isPersonal) {
      setFeedback({
        type: "error",
        message: "이력서 거래 기능은 개인 회원 전용입니다.",
      });
      return;
    }
    if (key === "ad" && !isCompany) {
      setFeedback({
        type: "error",
        message: "광고 공고 등록 기능은 회사 회원 전용입니다.",
      });
      return;
    }
    setActiveTab(key);
    if (key === "market" && marketResumes.length === 0 && !marketLoading) {
      loadMarketplace();
    }
    if (key === "ad" && myJobPostings.length === 0 && !adLoading) {
      loadMyJobPostings();
    }
  };

  const handleCreditProductPurchase = (productId) => {
    if (!productId) return;
    setSelectedProductId(productId);
    router.push(`/credit/checkout?productId=${productId}`);
  };

  const handlePurchaseResume = async (item) => {
    if (!item) return;
    if (!isPersonal) {
      setFeedback({
        type: "error",
        message: "이력서 구매는 개인 회원만 가능합니다.",
      });
      return;
    }
    if (item.purchased) {
      router.push(`/resumes/marketplace/${item.resumeId}`);
      return;
    }
    try {
      setPurchaseLoadingId(item.resumeId);
      const response = await purchaseResume(item.resumeId);
      const remaining = response?.remainingCredits;
      if (typeof remaining === "number") {
        setBalance(remaining);
      }
      setMarketResumes((prev) =>
        prev.map((resume) =>
          resume.resumeId === item.resumeId ? { ...resume, purchased: true } : resume
        )
      );
      setFeedback({ type: "success", message: response?.message || "이력서를 구매했습니다." });
      router.push(`/resumes/marketplace/${item.resumeId}`);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "이력서 구매 중 오류가 발생했습니다.";
      setFeedback({ type: "error", message });
    } finally {
      setPurchaseLoadingId(null);
    }
  };

  const handleRegisterAd = async (posting) => {
    if (!isCompany) {
      setFeedback({
        type: "error",
        message: "광고 공고 등록은 회사 회원만 가능합니다.",
      });
      return;
    }

    if (!posting.cUserIdx) {
      setFeedback({
        type: "error",
        message: "외부 공고는 광고로 등록할 수 없습니다. 직접 등록한 공고만 가능합니다.",
      });
      return;
    }

    if (advertisedPostingIds.has(posting.postingIdx)) {
      setFeedback({
        type: "error",
        message: "이미 광고로 등록된 채용공고입니다.",
      });
      return;
    }
    
    if (balance < 10000) {
      setFeedback({
        type: "error",
        message: "크레딧이 부족합니다. 최소 10,000 크레딧이 필요합니다.",
      });
      return;
    }

    if (!window.confirm(`"${posting.title}" 공고를 광고로 등록하시겠습니까?\n10,000 크레딧이 차감됩니다.`)) {
      return;
    }

    try {
      setPurchaseLoadingId(posting.postingIdx);
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7); // 기본 7일간 광고

      await api.post("/api/ad-postings", {
        postingIdx: posting.postingIdx,
        startDate: startDate.toISOString().slice(0, 19),
        endDate: endDate.toISOString().slice(0, 19),
      });

      setBalance(balance - 10000);
      setFeedback({ 
        type: "success", 
        message: "광고가 성공적으로 등록되었습니다! 메인 페이지에서 확인하세요." 
      });
      
      // 광고 등록된 공고 ID를 즉시 추가 (UI 즉시 반영)
      setAdvertisedPostingIds(prev => new Set([...prev, posting.postingIdx]));
      
      // 목록 새로고침
      loadMyJobPostings();
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "광고 등록 중 오류가 발생했습니다.";
      setFeedback({ type: "error", message });
    } finally {
      setPurchaseLoadingId(null);
    }
  };

  const renderStatusBadges = (item) => {
    const summary = item?.statusSummary || {};
    const ordered = STATUS_ORDER.filter((code) => summary[code] > 0).map((code) => [
      code,
      summary[code],
    ]);
    const fallback = Object.entries(summary).filter(([, count]) => count > 0);
    return (ordered.length > 0 ? ordered : fallback).map(([code, count]) => (
      <StatusChip key={code}>
        {STATUS_LOOKUP[code] || code} · {count}건
      </StatusChip>
    ));
  };

  const formatUpdatedAt = (value) => {
    if (!value) return "업데이트 정보 없음";
    try {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return "업데이트 정보 없음";
      return `최근 업데이트 ${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(date.getDate()).padStart(2, "0")}`;
    } catch {
      return "업데이트 정보 없음";
    }
  };

  return (
    <StoreContainer>
      <ContentWrapper>
        <HeaderSection>
          <h1>크레딧 상점</h1>
          <p>필요한 크레딧을 빠르게 충전하고 다양한 서비스를 이용해 보세요.</p>
          <BalanceBadge>
            <CreditCoinIcon />
            <div>
              <span>나의 보유 크레딧</span>
              <strong>{balance.toLocaleString()} C</strong>
            </div>
          </BalanceBadge>
        </HeaderSection>

        <TabBar>
          <TabButton $active={activeTab === "store"} onClick={() => handleTabChange("store")}>
            크레딧 상품
          </TabButton>
          {isPersonal && (
            <TabButton $active={activeTab === "market"} onClick={() => handleTabChange("market")}>
              이력서 거래
            </TabButton>
          )}
          {isCompany && (
            <TabButton $active={activeTab === "ad"} onClick={() => handleTabChange("ad")}>
              광고 공고 등록
            </TabButton>
          )}
        </TabBar>

        {feedback && (
          <FeedbackBar $type={feedback.type} role="alert">
            {feedback.message}
          </FeedbackBar>
        )}

        {activeTab === "store" ? (
          <>
            <CardSection>
              {products.map((product) => (
                <CreditProductCard
                  key={product.id}
                  badge={product.badge}
                  title={product.title}
                  description={product.description}
                  credits={product.credits}
                  price={product.price}
                  accent={PRIMARY}
                  imageVariant={product.imageVariant}
                  selected={selectedProductId === product.id}
                  onClick={() => handleCreditProductPurchase(product.id)}
                />
              ))}
            </CardSection>

            <ControlSection>
              <ClawToggle />
              <ButtonRow>
                <ClawButton variant="red" label="GO" />
                <ClawButton variant="blue" label="SET" />
              </ButtonRow>
            </ControlSection>
          </>
        ) : activeTab === "market" ? (
          <MarketplaceSection>
            {marketLoading ? (
              <LoadingPlaceholder>
                <CircularProgress size={28} />
                <span>이력서 거래 정보를 불러오는 중입니다…</span>
              </LoadingPlaceholder>
            ) : marketResumes.length === 0 ? (
              <EmptyMarket>
                <h3>아직 공개된 이력서가 없습니다.</h3>
                <p>개인 회원이 공개한 이력서를 구매하면 상세 열람이 가능합니다.</p>
              </EmptyMarket>
            ) : (
              <ResumeMarketGrid>
                {marketResumes.map((item) => {
                  const badges = renderStatusBadges(item);
                  return (
                    <MarketCard key={item.resumeId}>
                      <MarketHeader>
                        <CardTitle>{item.title}</CardTitle>
                        <OwnerLine>
                          {item.ownerName}
                          {item.ownerJobTitle ? ` · ${item.ownerJobTitle}` : ""}
                        </OwnerLine>
                        <StatusBadge>{item.highlightStatus || "지원 이력 없음"}</StatusBadge>
                      </MarketHeader>
                      <SummaryText>{item.summary || "자기소개가 등록되지 않았습니다."}</SummaryText>
                      {badges.length > 0 && <StatusList>{badges}</StatusList>}
                      <MarketMeta>{formatUpdatedAt(item.updatedAt)}</MarketMeta>
                      <CardFooter>
                        <PriceInfo>
                          <PriceLabel>열람 크레딧</PriceLabel>
                          <PriceTag>{Number(item.creditCost || 0).toLocaleString()} C</PriceTag>
                        </PriceInfo>
                        <PurchaseButton
                          type="button"
                          onClick={() => handlePurchaseResume(item)}
                          disabled={purchaseLoadingId === item.resumeId}
                          $purchased={Boolean(item.purchased)}
                        >
                          {item.purchased
                            ? "열람하기"
                            : purchaseLoadingId === item.resumeId
                            ? "처리 중…"
                            : "구매"}
                        </PurchaseButton>
                      </CardFooter>
                    </MarketCard>
                  );
                })}
              </ResumeMarketGrid>
            )}
          </MarketplaceSection>
        ) : (
          <MarketplaceSection>
            {adLoading ? (
              <LoadingPlaceholder>
                <CircularProgress size={28} />
                <span>채용공고 목록을 불러오는 중입니다…</span>
              </LoadingPlaceholder>
            ) : myJobPostings.length === 0 ? (
              <EmptyMarket>
                <h3>등록된 채용공고가 없습니다.</h3>
                <p>먼저 채용공고를 등록한 후 광고로 프로모션할 수 있습니다.</p>
              </EmptyMarket>
            ) : (
              <ResumeMarketGrid>
                {myJobPostings.map((posting) => {
                  console.log(`[렌더링] 공고 ${posting.postingIdx}:`, {
                    cUserIdx: posting.cUserIdx,
                    title: posting.title,
                    isAdvertised: advertisedPostingIds.has(posting.postingIdx)
                  });
                  return (
                  <MarketCard key={posting.postingIdx}>
                    <MarketHeader>
                      <CardTitle>{posting.title}</CardTitle>
                      <OwnerLine>{posting.companyName}</OwnerLine>
                      <StatusBadge>📍 {posting.location || "위치 미정"}</StatusBadge>
                    </MarketHeader>
                    <SummaryText>
                      {posting.description 
                        ? posting.description.substring(0, 100) + (posting.description.length > 100 ? "..." : "")
                        : "공고 설명이 없습니다."}
                    </SummaryText>
                    <MarketMeta>
                      마감일: {posting.deadline ? new Date(posting.deadline).toLocaleDateString() : "미정"}
                    </MarketMeta>
                    <CardFooter>
                      <PriceInfo>
                        <PriceLabel>광고 등록 비용</PriceLabel>
                        <PriceTag>10,000 C</PriceTag>
                      </PriceInfo>
                      <PurchaseButton
                        type="button"
                        onClick={() => handleRegisterAd(posting)}
                        disabled={
                          purchaseLoadingId === posting.postingIdx || 
                          balance < 10000 || 
                          advertisedPostingIds.has(posting.postingIdx) ||
                          !posting.cUserIdx  // 외부 공고는 비활성화
                        }
                      >
                        {purchaseLoadingId === posting.postingIdx
                          ? "처리 중…"
                          : !posting.cUserIdx
                          ? "외부 공고"
                          : advertisedPostingIds.has(posting.postingIdx)
                          ? "광고 중"
                          : balance < 10000
                          ? "크레딧 부족"
                          : "광고 등록"}
                      </PurchaseButton>
                    </CardFooter>
                  </MarketCard>
                  );
                })}
              </ResumeMarketGrid>
            )}
          </MarketplaceSection>
        )}
      </ContentWrapper>
    </StoreContainer>
  );
};

export default CreditPage;
