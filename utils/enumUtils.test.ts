import { isEnumValue } from './enumUtils';

enum WEEKDAYS {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
}

describe('enumUtils', () => {
  it('should return true if string is in enum', () => {
    expect(isEnumValue(WEEKDAYS, 'monday')).toBe(true);
  });
  it('should return false if string isnt in enum', () => {
    expect(isEnumValue(WEEKDAYS, 'saturday')).toBe(false);
  });
});
