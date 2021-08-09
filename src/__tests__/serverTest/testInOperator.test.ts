import SQLParser from '../../index';

describe('Test In Operator', () => {
  it('Test statement with in', async () => {
    const parser = new SQLParser();
    expect(parser.parseSql(`WHERE name in (null, 'a%bcd')`)).toStrictEqual({"name":{"$in":[null,"a%bcd"]}});
  });

  it('Test statement with not in', async () => {
    const parser = new SQLParser();
    expect(parser.parseSql(`WHERE name not in (null, 'a%bcd')`)).toStrictEqual({"name":{"$nin":[null,"a%bcd"]}});
  });
});