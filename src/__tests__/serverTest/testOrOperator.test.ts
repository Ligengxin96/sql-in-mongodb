import SQLParser from '../../index';

describe('Test or operator', () => {
  it('Test where condition with or operator', () => {
    const parser = new SQLParser();
    expect(parser.parseSql(`WHERE title = 'Land' or title = 'Mangrove'`)).toStrictEqual({ $or: [{ title: 'Land' }, { title: 'Mangrove' }] });
  });
});
