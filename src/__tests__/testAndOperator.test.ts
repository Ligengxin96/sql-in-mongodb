import SQLParser from '../index';

describe('Test and operator', () => {
  it('Test where condition with and operator', () => {
    const parser = new SQLParser();
    expect(parser.parseSql(`WHERE a > b and name = '123'`)).toStrictEqual(
      { $and: [{ $expr: { $gt: ["$a", "$b"] } }, { name: "123" }] }
    );
    expect(parser.parseSql(`WHERE a <> b and name = '123'`)).toStrictEqual(
      { $and: [{ $expr: { $ne: ["$a", "$b"] } }, { name: "123" }] }
    );
    expect(parser.parseSql(`WHERE title = 'Land of the midnight sun' and title = '123'`)).toStrictEqual(
      { $and: [{ title: 'Land of the midnight sun' }, { title: '123' }] }
    );
    expect(parser.parseSql(`select * from t WHERE title is null and title is not null`)).toStrictEqual(
      { $and: [{ title: null }, { title: { $ne: null } }] }
    );
    expect(parser.parseSql(`select * from t WHERE title = '123' and title is not null`)).toStrictEqual(
      { $and: [{ title: '123' }, { title: { $ne: null } }] }
    );
  });

});
