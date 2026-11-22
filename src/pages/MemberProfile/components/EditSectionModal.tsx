// React
import { useState } from 'react';
import { useForm } from 'react-hook-form';
// Libs
import { Button, Form, ModalActions, ModalTitle, Typography, useToast } from 'bp-kit';
import { Check, Save } from 'lucide-react';
// Components
import { FilterGroup } from '../../../components/FiltersSheet';
import { SectionDivider } from '../../../components/FormLayout';
import { SwitchRow } from '../../../components/SwitchRow';
// Local
import { MEMBER_FLAG_DESCRIPTIONS, MEMBER_FLAG_LABELS, MEMBER_FLAGS, MemberFlag } from '../../../domain/memberFlags';
import { MemberRecord } from '../../../domain/memberRecords';
import { firstNameOf } from '../../../domain/text';
import { RecordSection, RecordSectionFields, saveRecord, sectionResolver } from '../../../features/memberRecord';
import { invalidateQueries } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { sameItems } from '../../../lib/sameItems';
import { Relative } from '../../../repositories/family';
import { addMemberFlags, listMemberFlags, removeMemberFlags, saveMemberFlags } from '../../../repositories/memberFlags';

interface SpouseOffer {
  action: 'add' | 'remove';
  flags: MemberFlag[];
}

interface Props {
  personId: string;
  record: MemberRecord;
  section: RecordSection;
  optionalPhone: boolean;
  flags?: MemberFlag[];
  spouse?: Pick<Relative, 'id' | 'name'> | null;
  close: () => void;
}

export function EditSectionModal({ personId, record, section, optionalPhone, flags, spouse, close }: Props) {
  const { show: showToast, toast } = useToast();
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting, isDirty },
  } = useForm<MemberRecord>({ resolver: sectionResolver(section, optionalPhone), defaultValues: record });
  const [checkedFlags, setCheckedFlags] = useState(flags ?? []);
  const flaggable = !!flags && watch('membershipStatus') === 'active';
  const nextFlags = flaggable ? checkedFlags : [];
  const flagsChanged = !!flags && !sameItems(nextFlags, flags);
  const [spouseOffer, setSpouseOffer] = useState<SpouseOffer | null>(null);
  const [sharing, setSharing] = useState(false);

  const toggleFlag = (flag: MemberFlag) =>
    setCheckedFlags((current) =>
      current.includes(flag) ? current.filter((item) => item !== flag) : [...current, flag],
    );

  const submit = handleSubmit(async (values) => {
    try {
      if (isDirty) await saveRecord(personId, values);
      if (flags && flagsChanged) {
        await saveMemberFlags(personId, flags, nextFlags);
        await invalidateQueries(queryKeys.memberPage(personId));
      }
      const offer = spouse && flags ? await spouseOfferFor(spouse.id, flags) : null;
      if (offer) {
        setSpouseOffer(offer);
        return;
      }
      close();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Não foi possível salvar.');
    }
  });

  const spouseOfferFor = async (spouseId: string, current: MemberFlag[]): Promise<SpouseOffer | null> => {
    const added = nextFlags.filter((flag) => !current.includes(flag));
    if (added.length > 0) return { action: 'add', flags: added };
    const removed = flaggable ? current.filter((flag) => !nextFlags.includes(flag)) : [];
    if (removed.length === 0) return null;
    const spouseFlags = await listMemberFlags(spouseId);
    const shared = removed.filter((flag) => spouseFlags.includes(flag));
    return shared.length > 0 ? { action: 'remove', flags: shared } : null;
  };

  const applyToSpouse = async (offer: SpouseOffer) => {
    if (!spouse) return;
    setSharing(true);
    try {
      await (offer.action === 'add' ? addMemberFlags : removeMemberFlags)(spouse.id, offer.flags);
      await invalidateQueries(queryKeys.memberPage(spouse.id));
      close();
    } catch (e) {
      setSharing(false);
      showToast(e instanceof Error ? e.message : `Não foi possível salvar a sinalização de ${spouse.name}.`);
    }
  };

  if (spouse && spouseOffer) {
    const flagNames = spouseOffer.flags.map((flag) => MEMBER_FLAG_LABELS[flag].toLowerCase()).join(' e ');
    const adding = spouseOffer.action === 'add';
    return (
      <>
        <ModalTitle onClose={close}>Sinalização salva</ModalTitle>
        <Typography type="p">
          {adding
            ? `Deseja marcar ${spouse.name} também como ${flagNames}?`
            : `${spouse.name} também está como ${flagNames}. Deseja desmarcar?`}
        </Typography>
        <ModalActions>
          <Button type="button" variant="primary" disabled={sharing} onClick={() => applyToSpouse(spouseOffer)}>
            {sharing ? (
              'Salvando...'
            ) : (
              <>
                <Check size={16} />
                {adding ? 'Sim, marcar' : 'Sim, desmarcar'} {firstNameOf(spouse.name)}
              </>
            )}
          </Button>
          <Button type="button" variant="secondary" disabled={sharing} onClick={close}>
            Não
          </Button>
        </ModalActions>
        {toast}
      </>
    );
  }

  return (
    <>
      <ModalTitle onClose={close}>{section.title}</ModalTitle>
      <Form onSubmit={submit}>
        <RecordSectionFields section={section} control={control} setValue={setValue} />
        {flaggable && (
          <SectionDivider aria-label="Sinalizações" role="region">
            <FilterGroup>
              {MEMBER_FLAGS.map((flag) => (
                <SwitchRow
                  key={flag}
                  title={MEMBER_FLAG_LABELS[flag]}
                  hint={MEMBER_FLAG_DESCRIPTIONS[flag]}
                  checked={checkedFlags.includes(flag)}
                  onChange={() => toggleFlag(flag)}
                />
              ))}
            </FilterGroup>
          </SectionDivider>
        )}
        <ModalActions>
          <Button type="submit" variant="primary" disabled={isSubmitting || (!isDirty && !flagsChanged)}>
            {isSubmitting ? (
              'Salvando...'
            ) : (
              <>
                <Save size={16} />
                Salvar
              </>
            )}
          </Button>
        </ModalActions>
      </Form>
      {toast}
    </>
  );
}
