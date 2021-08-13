import SQLParser from '../src/SQLParser';

describe('Test getSelectedTable function', () => {
  it('Test getSelectedTable function', () => {
    const parser = new SQLParser();
    expect(parser.getSelectedTable('')).toBe('UNKNOWN');
    expect(parser.getSelectedTable(`where a = 1`)).toBe('UNKNOWN');
    expect(parser.getSelectedTable(`select * from t`)).toBe('t');
    expect(parser.getSelectedTable(`select t1.id from t1`)).toBe('t1');
    expect(parser.getSelectedTable(`select a,b,c from t1 where a = 1 or b = c`)).toBe('t1');
  });
});
