// Libs
import styled from 'styled-components';

export const VideoWrapper = styled.div`
  position: relative;
  width: 100%;
  padding-top: 56.25%;
  border-radius: ${({ theme }) => theme.rounded.md};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.ink};

  iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: none;
  }
`;
