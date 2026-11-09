// Libs
import styled from 'styled-components';

const GUTTER = '20px';
const CARD_PADDING = '40px';

export const Shell = styled.div`
  display: flow-root;
  min-height: 100dvh;
  background: ${({ theme }) => theme.colors.canvas};
  font-family: ${({ theme }) => theme.typography.fontFamily};

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    background: ${({ theme }) => theme.colors.surfaceSoft};
  }
`;

export const TopBar = styled.header`
  position: sticky;
  top: 0;
  z-index: 2;
  background: ${({ theme }) => theme.colors.canvas};
  border-bottom: 1px solid ${({ theme }) => theme.colors.hairline};
`;

export const TopBarInner = styled.div`
  max-width: 520px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.md} ${GUTTER};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    max-width: 720px;
    padding: ${({ theme }) => theme.spacing.base} ${({ theme }) => theme.spacing.lg};
  }
`;

export const BrandRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  & > img {
    width: 28px;
    height: 28px;
    flex-shrink: 0;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    gap: ${({ theme }) => theme.spacing.md};

    & > img {
      width: 32px;
      height: 32px;
    }
  }
`;

export const TopTitle = styled.span`
  flex: 1;
  min-width: 0;
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.ink};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: 17px;
  }
`;

export const StepCount = styled.span`
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.muted};

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: 14px;
  }
`;

export const Progress = styled.div<{ $steps: number }>`
  display: grid;
  grid-template-columns: repeat(${({ $steps }) => $steps}, 1fr);
  gap: ${({ theme }) => theme.spacing.xs};
`;

export const ProgressSegment = styled.span<{ $done: boolean }>`
  height: 4px;
  border-radius: ${({ theme }) => theme.rounded.full};
  background: ${({ $done, theme }) => ($done ? theme.colors.primary : theme.colors.hairline)};
  transition: background 0.2s ease;
`;

export const Body = styled.main`
  max-width: 520px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.lg} ${GUTTER} ${({ theme }) => theme.spacing.xl};
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    max-width: 720px;
    margin: ${({ theme }) => theme.spacing.xl} auto ${({ theme }) => theme.spacing.xxl};
    padding: ${CARD_PADDING};
    gap: ${({ theme }) => theme.spacing.lg};
    background: ${({ theme }) => theme.colors.canvas};
    border: 1px solid ${({ theme }) => theme.colors.hairline};
    border-radius: ${({ theme }) => theme.rounded.lg};
  }
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    gap: ${({ theme }) => theme.spacing.lg};
  }
`;

export const PageHeading = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const PageTitle = styled.h1`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.displayXl.fontSize};
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.5px;
  color: ${({ theme }) => theme.colors.ink};

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: 32px;
  }
`;

export const PageLead = styled.p`
  margin: 0;
  font-size: 15px;
  line-height: 1.45;
  color: ${({ theme }) => theme.colors.body};
`;

export const FieldPair = styled.div`
  display: grid;
  gap: 20px;

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: 1fr 1fr;
    gap: ${({ theme }) => theme.spacing.base};
    align-items: start;
  }
`;

export const ActionBar = styled.div`
  position: sticky;
  bottom: 0;
  z-index: 1;
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin: ${({ theme }) => theme.spacing.sm} -${GUTTER} calc(-1 * ${({ theme }) => theme.spacing.xl});
  padding: ${({ theme }) => theme.spacing.md} ${GUTTER}
    calc(${({ theme }) => theme.spacing.lg} + env(safe-area-inset-bottom));
  background: ${({ theme }) => theme.colors.canvas};
  border-top: 1px solid ${({ theme }) => theme.colors.hairline};

  & > * {
    flex: 1;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    justify-content: flex-end;
    margin: ${({ theme }) => theme.spacing.sm} -${CARD_PADDING} -${CARD_PADDING};
    padding: ${({ theme }) => theme.spacing.base} ${CARD_PADDING};
    border-radius: 0 0 ${({ theme }) => theme.rounded.lg} ${({ theme }) => theme.rounded.lg};

    & > * {
      flex: 0 0 auto;
      min-width: 160px;
    }
  }
`;

export const ErrorMsg = styled.p`
  color: ${({ theme }) => theme.colors.primaryErrorText};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
`;

export const ErrorBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};

  & > ${ErrorMsg} {
    margin: 0;
  }
`;

export const ContactList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  border: 1px solid ${({ theme }) => theme.colors.hairline};
  border-radius: ${({ theme }) => theme.rounded.md};

  & > li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${({ theme }) => theme.spacing.md};
    padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.base};
  }

  & > li + li {
    border-top: 1px solid ${({ theme }) => theme.colors.hairline};
  }
`;

export const ContactName = styled.span`
  min-width: 0;
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.ink};
`;

export const ContactLink = styled.a`
  flex-shrink: 0;
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
`;
