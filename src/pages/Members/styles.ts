// Libs
import styled from 'styled-components';

export const MemberGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export const MemberCard = styled.div<{ $clickable: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.base} ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.hairline};
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.canvas};
  font: inherit;
  text-align: center;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};

  &:hover {
    border-color: ${({ theme, $clickable }) => ($clickable ? theme.colors.borderStrong : theme.colors.hairline)};
  }
`;

export const MemberCardName = styled.span`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  font-weight: 600;
  line-height: 1.3;
  color: ${({ theme }) => theme.colors.ink};
`;

export const ViewRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin: -${({ theme }) => theme.spacing.sm} 0 ${({ theme }) => theme.spacing.md};
`;
