// Libs
import styled from 'styled-components';

export const Sections = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
`;

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const EmptySectionHint = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  color: ${({ theme }) => theme.colors.muted};
`;

export const ModuleSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

export const ModuleTitle = styled.h2`
  margin: 0;
  padding-bottom: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.hairline};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.titleMd.fontSize};
  font-weight: ${({ theme }) => theme.typography.titleMd.fontWeight};
  color: ${({ theme }) => theme.colors.ink};
`;
