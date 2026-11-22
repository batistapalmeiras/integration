// React
import { ReactNode } from 'react';
// Libs
import styled from 'styled-components';
// Local
import { Avatar } from '../Avatar';

const Wrap = styled.span`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  min-width: 0;
`;

const AvatarSlot = styled.span`
  display: none;

  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: inline-flex;
  }
`;

const Text = styled.span`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  min-width: 0;
`;

const Name = styled.span`
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

interface Props {
  name: string;
  children?: ReactNode;
}

export function NameWithAvatar({ name, children }: Props) {
  return (
    <Wrap>
      <AvatarSlot>
        <Avatar name={name} size={32} />
      </AvatarSlot>
      <Text>
        <Name>{name}</Name>
        {children}
      </Text>
    </Wrap>
  );
}
