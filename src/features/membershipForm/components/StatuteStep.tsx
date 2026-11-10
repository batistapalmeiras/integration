// React
import { useState } from 'react';
import { Control, Controller } from 'react-hook-form';
// Libs
import { Checkbox, Typography } from 'bp-kit';
import { BookOpen, CheckCircle2 } from 'lucide-react';
// Local
import { ErrorMsg } from '../../../components/PublicPage/styles';
import { STATUTE_CHAPTERS, StatuteChapter } from '../../../domain/statute';
import { MembershipFormValues } from '../schema';
import { ChapterCard, ChapterList, ChapterNumber, ChapterStatus, ChapterText, ChapterTitle } from '../styles';
import { StatuteReader } from './StatuteReader';

interface Props {
  control: Control<MembershipFormValues>;
  readChapters: string[];
  onChapterRead: (chapterId: string) => void;
}

export function StatuteStep({ control, readChapters, onChapterRead }: Props) {
  const [open, setOpen] = useState<StatuteChapter | null>(null);

  return (
    <>
      <Typography type="p">
        Sugerimos que você leia o estatuto da igreja para entender como funcionamos. Ao se tornar membro, você declara
        que concorda com todo ele. Para ter acesso ao texto completo, basta pedir ao Pr. Ismael Arêdes, que ele te
        encaminha.
      </Typography>
      <Typography type="p">
        Abaixo estão os Capítulos II e III, que tratam da admissão e do desligamento de membros e dos direitos e deveres
        de um membro. Toque em cada um para ler com atenção.
      </Typography>

      <ChapterList>
        {STATUTE_CHAPTERS.map((chapter) => {
          const read = readChapters.includes(chapter.id);
          return (
            <ChapterCard key={chapter.id} type="button" $read={read} onClick={() => setOpen(chapter)}>
              <ChapterText>
                <ChapterNumber>{chapter.number}</ChapterNumber>
                <ChapterTitle>{chapter.title}</ChapterTitle>
                <ChapterStatus $read={read}>{read ? 'Lido' : 'Toque para ler'}</ChapterStatus>
              </ChapterText>
              {read ? <CheckCircle2 size={22} /> : <BookOpen size={22} />}
            </ChapterCard>
          );
        })}
      </ChapterList>

      <Controller
        control={control}
        name="statuteAgreed"
        render={({ field, fieldState }) => (
          <>
            <Checkbox
              label="Declaro que estou de acordo em cumprir todo o Estatuto Social da Igreja Batista Central no Palmeiras."
              checked={field.value}
              aria-invalid={!!fieldState.error}
              onChange={(e) => field.onChange(e.target.checked)}
            />
            {fieldState.error && <ErrorMsg>{fieldState.error.message}</ErrorMsg>}
          </>
        )}
      />

      {open && (
        <StatuteReader
          chapter={open}
          onClose={() => setOpen(null)}
          onRead={() => {
            onChapterRead(open.id);
            setOpen(null);
          }}
        />
      )}
    </>
  );
}
