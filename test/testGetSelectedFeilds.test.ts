import SQLParser from '../src/SQLParser';

describe('Test getSelectedFeilds function', () => {
  it('Test getSelectedFeilds function', () => {
    const parser = new SQLParser();
    expect(parser.getSelectedFeilds('')).toStrictEqual({});
    expect(parser.getSelectedFeilds(`where a = 1`)).toStrictEqual({});
    expect(parser.getSelectedFeilds(`select * from t`)).toStrictEqual({});
    expect(parser.getSelectedFeilds(`select a from t`)).toStrictEqual({ a: 1 });
    expect(parser.getSelectedFeilds(`select a, b from t`)).toStrictEqual({ a: 1, b: 1 });
    expect(parser.getSelectedFeilds(`select a, b, 1 as c, d as dd from t`)).toStrictEqual({ a: 1, b: 1, d: 1 });
  });
});
