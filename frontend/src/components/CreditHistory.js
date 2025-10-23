// frontend/src/components/CreditHistory.js
"use client";
import React from 'react';
import styled from 'styled-components';

const HistoryContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin-top: 3rem;
`;

const HistoryTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme?.palette?.divider || '#e0e0e0'};
  }

  th {
    background-color: ${({ theme }) => theme?.palette?.background?.paper || '#f5f5f5'};
  }
`;

const dummyHistory = [
  { id: 1, date: '2025-10-22', item: '1,200 크레딧 충전', amount: '₩10,000' },
  { id: 2, date: '2025-10-15', item: '550 크레딧 충전', amount: '₩5,000' },
  { id: 3, date: '2025-10-01', item: '100 크레딧 충전', amount: '₩1,000' },
];

const CreditHistory = () => {
  return (
    <HistoryContainer>
      <h2>크레딧 결제 내역</h2>
      <HistoryTable>
        <thead>
          <tr>
            <th>결제일</th>
            <th>내용</th>
            <th>금액</th>
          </tr>
        </thead>
        <tbody>
          {dummyHistory.map(item => (
            <tr key={item.id}>
              <td>{item.date}</td>
              <td>{item.item}</td>
              <td>{item.amount}</td>
            </tr>
          ))}
        </tbody>
      </HistoryTable>
    </HistoryContainer>
  );
};

export default CreditHistory;
