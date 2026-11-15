// Local
import { centeredFrame, frameCrop, moveFrame, zoomFrame } from '../../src/lib/photoFrame';

describe('photo frame', () => {
  it('starts with the middle square of the photo', () => {
    expect(frameCrop(centeredFrame(1600, 900, 300))).toEqual({ x: 350, y: 0, side: 900 });
  });

  it('moves the photo but never leaves an empty edge', () => {
    const frame = centeredFrame(1600, 900, 300);
    expect(frameCrop(moveFrame(frame, 1000, 0))).toEqual({ x: 0, y: 0, side: 900 });
    expect(frameCrop(moveFrame(frame, -1000, 0))).toEqual({ x: 700, y: 0, side: 900 });
    expect(frameCrop(moveFrame(frame, 0, 50))).toEqual({ x: 350, y: 0, side: 900 });
  });

  it('zooms into the middle of what is in view', () => {
    expect(frameCrop(zoomFrame(centeredFrame(900, 900, 300), 2))).toEqual({ x: 225, y: 225, side: 450 });
  });

  it('keeps the zoom between 1x and 3x', () => {
    expect(zoomFrame(centeredFrame(900, 900, 300), 10).zoom).toBe(3);
    expect(zoomFrame(centeredFrame(900, 900, 300), 0.2).zoom).toBe(1);
  });
});
