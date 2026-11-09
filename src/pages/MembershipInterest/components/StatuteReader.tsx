// React
import { useEffect } from 'react';
// Libs
import { BottomSheet, Button, IconButton } from 'bp-kit';
import { Check, X } from 'lucide-react';
// Local
import { StatuteChapter } from '../../../domain/statute';
import {
  Article,
  ArticleLabel,
  ChapterNumber,
  Clause,
  ClauseLabel,
  Clauses,
  Paragraph,
  ParagraphLabel,
  Reader,
  ReaderFooter,
  ReaderHeader,
  ReaderHeading,
  ReaderTitle,
} from '../styles';

interface Props {
  chapter: StatuteChapter;
  onClose: () => void;
  onRead: () => void;
}

export function StatuteReader({ chapter, onClose, onRead }: Props) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <BottomSheet onClose={onClose}>
      <Reader aria-labelledby={`statute-${chapter.id}`}>
        <ReaderHeader>
          <ReaderHeading>
            <ChapterNumber>{chapter.number}</ChapterNumber>
            <ReaderTitle id={`statute-${chapter.id}`}>{chapter.title}</ReaderTitle>
          </ReaderHeading>
          <IconButton
            type="button"
            icon={<X size={18} />}
            iconPosition="center"
            variant="secondary"
            size="sm"
            aria-label="Fechar"
            onClick={onClose}
          />
        </ReaderHeader>

        {chapter.articles.map((article) => (
          <Article key={article.label}>
            <ArticleLabel>{article.label}</ArticleLabel>
            {article.blocks.map((block) => (
              <div key={block.label ?? 'caput'}>
                <Paragraph>
                  {block.label && <ParagraphLabel>{block.label}</ParagraphLabel>}
                  {block.text}
                </Paragraph>
                {block.clauses && (
                  <Clauses>
                    {block.clauses.map((clause) => (
                      <Clause key={clause.label}>
                        <ClauseLabel>{clause.label}</ClauseLabel>
                        <span>{clause.text}</span>
                      </Clause>
                    ))}
                  </Clauses>
                )}
              </div>
            ))}
          </Article>
        ))}

        <ReaderFooter>
          <Button type="button" variant="primary" size="lg" fullWidth onClick={onRead}>
            <Check size={16} />
            Li e entendi
          </Button>
        </ReaderFooter>
      </Reader>
    </BottomSheet>
  );
}
