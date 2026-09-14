import { formatMediaTime } from '@/lib/utils/formatMediaTime';

describe('formatMediaTime', () => {
  it('formats seconds under a minute with a zero minute', () => {
    expect(formatMediaTime(0)).toBe('0:00');
    expect(formatMediaTime(7)).toBe('0:07');
  });

  it('formats minutes and seconds', () => {
    expect(formatMediaTime(83)).toBe('1:23');
    expect(formatMediaTime(600)).toBe('10:00');
  });

  it('adds an hours segment past 3600 seconds', () => {
    expect(formatMediaTime(3661)).toBe('1:01:01');
  });

  it('clamps invalid input to zero', () => {
    expect(formatMediaTime(-5)).toBe('0:00');
    expect(formatMediaTime(NaN)).toBe('0:00');
  });
});
