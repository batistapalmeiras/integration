// Local
import { centerSquare } from '../../src/lib/squareImage';

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
