// Libs
import styled from 'styled-components';

export const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const Progress = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: ${({ theme }) => theme.spacing.xs};
`;

export const ProgressSegment = styled.span<{ $done: boolean }>`
  height: 4px;
  border-radius: ${({ theme }) => theme.rounded.full};
  background: ${({ $done, theme }) => ($done ? theme.colors.primary : theme.colors.hairline)};
  transition: background 0.2s ease;
`;

export const StepHeading = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const StepCount = styled.span`
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  font-weight: ${({ theme }) => theme.typography.caption.fontWeight};
  color: ${({ theme }) => theme.colors.muted};
`;

export const Hint = styled.p`
  margin: calc(-1 * ${({ theme }) => theme.spacing.sm}) 0 0;
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  line-height: ${({ theme }) => theme.typography.caption.lineHeight};
  color: ${({ theme }) => theme.colors.muted};
`;

export const FieldRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const NavRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.sm};

  & > * {
    flex: 1;
  }
`;

export const ChapterList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const ChapterCard = styled.button<{ $read: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  width: 100%;
  padding: ${({ theme }) => theme.spacing.base};
  background: ${({ $read, theme }) => ($read ? theme.colors.primarySoft : theme.colors.canvas)};
  border: 1px solid ${({ $read, theme }) => ($read ? theme.colors.primary : theme.colors.hairline)};
  border-radius: ${({ theme }) => theme.rounded.md};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  & > svg {
    flex-shrink: 0;
    color: ${({ $read, theme }) => ($read ? theme.colors.luxe : theme.colors.mutedSoft)};
  }
`;

export const ChapterText = styled.span`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
`;

export const ChapterNumber = styled.span`
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.luxe};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

export const ChapterTitle = styled.span`
  font-size: ${({ theme }) => theme.typography.bodyMd.fontSize};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.ink};
`;

export const ChapterStatus = styled.span<{ $read: boolean }>`
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  color: ${({ $read, theme }) => ($read ? theme.colors.luxe : theme.colors.muted)};
`;

export const Reader = styled.article`
  max-width: 640px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  color: ${({ theme }) => theme.colors.body};
`;

export const ReaderHeader = styled.header`
  position: sticky;
  top: -20px;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: -20px;
  padding: 20px 0 ${({ theme }) => theme.spacing.base};
  background: ${({ theme }) => theme.colors.canvas};
  border-bottom: 1px solid ${({ theme }) => theme.colors.hairline};
`;

export const ReaderHeading = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  flex: 1;
`;

export const ReaderTitle = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.titleMd.fontSize};
  font-weight: 700;
  line-height: 1.3;
  color: ${({ theme }) => theme.colors.ink};
`;

export const Article = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const ArticleLabel = styled.h3`
  margin: 0;
  align-self: flex-start;
  padding: 2px ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.rounded.xs};
  background: ${({ theme }) => theme.colors.primarySoft};
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.luxe};
`;

export const Paragraph = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.bodyMd.fontSize};
  line-height: 1.65;
`;

export const ParagraphLabel = styled.strong`
  color: ${({ theme }) => theme.colors.ink};
  margin-right: ${({ theme }) => theme.spacing.xs};
`;

export const Clauses = styled.ol`
  list-style: none;
  margin: ${({ theme }) => theme.spacing.md} 0 0;
  padding: 0 0 0 ${({ theme }) => theme.spacing.sm};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  border-left: 2px solid ${({ theme }) => theme.colors.hairline};
`;

export const Clause = styled.li`
  display: grid;
  grid-template-columns: 2.25rem 1fr;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.bodyMd.fontSize};
  line-height: 1.6;
`;

export const ClauseLabel = styled.span`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.ink};
  text-align: right;
  padding-right: ${({ theme }) => theme.spacing.xs};
`;

export const ReaderFooter = styled.div`
  padding-top: ${({ theme }) => theme.spacing.sm};
`;

export const ReviewSection = styled.section`
  background: ${({ theme }) => theme.colors.canvas};
  border: 1px solid ${({ theme }) => theme.colors.hairline};
  border-radius: ${({ theme }) => theme.rounded.md};
  padding: ${({ theme }) => theme.spacing.base};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const ReviewHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const ReviewTitle = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.bodyMd.fontSize};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.ink};
`;

export const ReviewList = styled.dl`
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const ReviewItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  dt {
    font-size: ${({ theme }) => theme.typography.caption.fontSize};
    color: ${({ theme }) => theme.colors.muted};
  }

  dd {
    margin: 0;
    font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
    color: ${({ theme }) => theme.colors.ink};
    overflow-wrap: anywhere;
  }
`;
