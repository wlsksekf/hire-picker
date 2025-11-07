import styled from 'styled-components';

export const StyledFormWrapper = styled.div`
  width: 100%;
  max-width: 420px;
  margin: 0 auto;

  .form-container {
    width: 100%;
    border-radius: 0.75rem;
    background-color: ${props => props.theme.palette.background.paper};
    padding: 2rem;
    color: ${props => props.theme.palette.text.primary};
    border: 1px solid ${props => props.theme.palette.divider};
  }

  .title {
    text-align: center;
    font-size: 1.5rem;
    line-height: 2rem;
    font-weight: 700;
    color: ${props => props.theme.palette.text.primary};
  }

  .form {
    margin-top: 1.5rem;
  }

  .input-group {
    margin-top: 1rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
  }

  .input-group label {
    display: block;
    color: ${props => props.theme.palette.text.secondary};
    margin-bottom: 4px;
  }

    .input-group input,
    .input-group .MuiInputBase-root { // MUI TextField 루트 요소 타겟
      width: 100%;
      border-radius: 0.375rem !important;
      border: 1px solid ${props => props.theme.palette.divider};
      outline: 0;
      background-color: ${props => props.theme.palette.background.paper};
      padding: 0.75rem 1rem;
      color: ${props => props.theme.palette.text.primary};
      -webkit-text-fill-color: ${props => props.theme.palette.text.primary}; // 자동완성 시 글자색 강제

      &::placeholder {
        color: ${props => props.theme.palette.text.secondary}; /* 플레이스홀더 색상 연하게 */
        opacity: 1; /* Firefox에서 기본 opacity를 재정의 */
      }
    }

  // MUI TextField 내부의 input 스타일 조정

  .input-group .MuiInputBase-input {
    padding: 0;

    background-color: transparent; // 내부 input 배경 투명하게
  }

  .input-group .MuiOutlinedInput-notchedOutline {
    border: none !important; // MUI 기본 테두리 제거
  }

  .input-group input:focus,
  .input-group .MuiInputBase-root:focus-within {
    border-color: ${props => props.theme.palette.primary.main};
  }

  .sign {
    display: block;
    width: 100%;
    background-color: ${props => props.theme.palette.primary.main};
    padding: 0.75rem;
    text-align: center;
    color: ${props => props.theme.palette.primary.contrastText};
    border: none;
    border-radius: 0.375rem;
    font-weight: 600;
    margin-top: 1.5rem;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .sign:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .social-message {
    display: flex;
    align-items: center;
    padding-top: 1rem;
  }

  .line {
    height: 1px;
    flex: 1 1 0%;
    background-color: ${props => props.theme.palette.divider};
  }

  .social-message .message {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: ${props => props.theme.palette.text.secondary};
  }

  .social-icons {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
  }

  .social-icons .icon {
    background-color: transparent;
    margin: 0 8px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
  }

  .social-icons .icon:hover {
    background-color: ${props => props.theme.palette.action.hover};
  }

  .social-icons .icon svg {
    height: 1.25rem;
    width: 1.25rem;
    fill: ${props => props.theme.palette.text.primary};
  }
`;
