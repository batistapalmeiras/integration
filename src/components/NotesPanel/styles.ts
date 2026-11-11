// Libs
import styled from 'styled-components';

export const NoteText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: ${({ theme }) => theme.spacing.sm} 0;
`;

export const NoteBody = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 15px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.ink};
  white-space: pre-wrap;
`;

export const NoteDate = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.muted};
`;

export const PrivateHint = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.muted};
`;

export const NoteActions = styled.div`
  display: flex;
  flex-shrink: 0;
  gap: ${({ theme }) => theme.spacing.xs};
`;
