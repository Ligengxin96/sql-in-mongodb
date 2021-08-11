import SQLParser from '../index';

describe('Test or operator', () => {
  it('Test where condition with or operator', () => {
    const parser = new SQLParser();
    expect(parser.parseSql(`WHERE title = 'Land' or title = 'Mangrove'`)).toStrictEqual({ $or: [{ title: 'Land' }, { title: 'Mangrove' }] });
    expect(parser.parseSql(`WHERE a like 'a1' or b = 'b1'`)).toStrictEqual({ $or: [{ a: { $regex: 'a1', $options: 'i' } }, { b: 'b1' }] });
    expect(parser.parseSql(`WHERE a > b or name = '123'`)).toStrictEqual(
      { $or: [{ $expr: { $gt: ["$a", "$b"] } }, { name: "123" }] }
    );
    expect(parser.parseSql(`WHERE a <> b or name = '123'`)).toStrictEqual(
      { $or: [{ $expr: { $ne: ["$a", "$b"] } }, { name: "123" }] }
    );
    expect(parser.parseSql(`WHERE title = 'Land of the midnight sun' or title = '123'`)).toStrictEqual(
      { $or: [{ title: 'Land of the midnight sun' }, { title: '123' }] }
    );
    expect(parser.parseSql(`select * from t WHERE title is null or title is not null`)).toStrictEqual(
      { $or: [{ title: null }, { title: { $ne: null } }] }
    );
    expect(parser.parseSql(`select * from t WHERE title = '123' or title is not null`)).toStrictEqual(
      { $or: [{ title: '123' }, { title: { $ne: null } }] }
    );
  });
});
