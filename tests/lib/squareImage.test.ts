// Local
import { centerSquare, fitInside } from '../../src/lib/squareImage';

describe('centerSquare', () => {
  it('keeps the middle of a landscape photo', () => {
    expect(centerSquare(1600, 900)).toEqual({ x: 350, y: 0, side: 900 });
  });

  it('keeps the middle of a portrait photo', () => {
    expect(centerSquare(900, 1600)).toEqual({ x: 0, y: 350, side: 900 });
  });

  it('keeps a square photo whole', () => {
    expect(centerSquare(500, 500)).toEqual({ x: 0, y: 0, side: 500 });
  });
});

describe('fitInside', () => {
  it('shrinks a big photo to the longest side limit, keeping its shape', () => {
    expect(fitInside(4032, 3024, 1080)).toEqual({ width: 1080, height: 810 });
    expect(fitInside(3024, 4032, 1080)).toEqual({ width: 810, height: 1080 });
  });

  it('keeps a small photo as it is', () => {
    expect(fitInside(800, 600, 1080)).toEqual({ width: 800, height: 600 });
  });
});
