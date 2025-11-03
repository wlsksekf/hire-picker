import { keyframes } from 'styled-components';

// 전체 애니메이션 시간
export const animationDuration = '12s';

// 집게 이동 애니메이션
export const grabberAnimation = keyframes`
  0% { transform: translate(-50%, 0px); opacity: 1; }
  10% { transform: translate(-150%, 0px); }
  20% { transform: translate(-150%, 240px); }
  25% { transform: translate(-150%, 240px); }
  80% { transform: translate(-150%, 0px); }
  89.9% { opacity: 1; }
  90% { opacity: 0; }
  100% { transform: translate(-50%, 0px); opacity: 0; }
`;

// 잡힌 아이템이 보이는 애니메이션
export const grabbedItemVisibility = keyframes`
  0%, 19.9% { opacity: 0; }
  20% { opacity: 1; }
  89.9% { opacity: 1; }
  90%, 100% { opacity: 0; }
`;

// 바닥 아이템이 사라지는 애니메이션
export const itemDisappear = keyframes`
  0%, 19.9% { opacity: 1; }
  20% { opacity: 0; }
  99.9% { opacity: 0; }
  100% { opacity: 1; }
`;
