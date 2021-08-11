import SQLParser from '../index';

describe('Test or operator', () => {
  it('Test where condition with or operator', () => {
    const parser = new SQLParser();
    expect(parser.parseSql(`WHERE title = 'Land' or title = 'Mangrove'`)).toStrictEqual({ $or: [{ title: 'Land' }, { title: 'Mangrove' }] });
    expect(parser.parseSql(`WHERE a like 'a1' or b = 'b1'`)).toStrictEqual({ $or: [{ a: { $regex: 'a1', $options: 'i' } }, { b: 'b1' }] });
  });
});
