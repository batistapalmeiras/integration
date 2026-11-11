// Libs
import styled, { css } from 'styled-components';

export const FormContent = styled.div`
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
`;

export const FormActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};

  & > button {
    width: 100%;
  }
`;

export const SectionDivider = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.hairline};
  padding-top: ${({ theme }) => theme.spacing.xl};
`;

export const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: ${({ theme }) => theme.spacing.base} ${({ theme }) => theme.spacing.lg};
  align-items: start;

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export const FieldStack = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

export const WideField = styled(FieldStack)`
  grid-column: 1 / -1;
`;

export const EndActions = styled.div`
  display: flex;
  justify-content: flex-end;

  & > button {
    width: 100%;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    & > button {
      width: auto;
    }
  }
`;

export const DetailContent = styled(FormContent)`
  max-width: 760px;
`;

export const twoColumnsWhenRoom = css`
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(max(140px, calc((100% - ${({ theme }) => theme.spacing.lg}) / 2)), 1fr)
  );
  gap: ${({ theme }) => theme.spacing.base} ${({ theme }) => theme.spacing.lg};
`;

export const EntryGrid = styled.div`
  ${twoColumnsWhenRoom}
`;
