import SQLParser from '../index';

describe('Test base case', () => {
  it('Test wrong sql query', () => {
    const parser = new SQLParser();
    try {
      parser.parseSql('');
    } catch (error) {
      expect(error.message).toStrictEqual('Invalid SQL statement, Please check your SQL statement.');
    }

    try {
      parser.parseSql('WHERE error = ');
    } catch (error) {
      expect(error.message).toStrictEqual(`Expected "#", "$", "'", "(", "+", "-", "--", "/*", ":", "?", "@", "@@", "AVG", "BINARY", "CASE", "CAST", "COUNT", "CURRENT_DATE", "CURRENT_TIME", "CURRENT_TIMESTAMP", "CURRENT_USER", "DATE", "DATETIME", "FALSE", "INTERVAL", "MAX", "MIN", "NULL", "SESSION_USER", "SUM", "SYSTEM_USER", "TIME", "TIMESTAMP", "TRUE", "USER", "X", "\\\"", "\`", [ \\t\\n\\r], [0-9], or [A-Za-z_] but end of input found.`);
    }

    try {
      parser.parseSql(`select from t WHERE title = 'error'`)
    } catch (error) {
      expect(error.message).toStrictEqual('Invalid SQL statement, Please check your SQL statement.');
    }

    try {
      parser.parseSql(`select from WHERE title = 'error'`)
    } catch (error) {
      expect(error.message).toStrictEqual('Invalid SQL statement, Please check your SQL statement.');
    }

    try {
      parser.parseSql(`select from t title = 'error'`)
    } catch (error) {
      expect(error.message).toStrictEqual('Invalid SQL statement, Please check your SQL statement.');
    }

    try {
      parser.parseSql(`select from t WHERE title`)
    } catch (error) {
      expect(error.message).toStrictEqual('Invalid SQL statement, Please check your SQL statement.');
    }

    try {
      parser.parseSql(`select * from t1 where not exists (select * from t2)`)
    } catch (error) {
      expect(error.message).toStrictEqual(`Operator 'NOT EXISTS' not currently supported.`);
    }
    try {
      parser.parseSql(`select * from t1 where id in(select id from t2)`)
    } catch (error) {
      expect(error.message).toStrictEqual("The value: 'SELECT `id` FROM `t2`' on the IN operator right is not currently supported.");
    }
  });

  it('Test sql query', () => {
    const parser = new SQLParser();
    expect(parser.parseSql(`select * from t`)).toStrictEqual({});
    expect(parser.parseSql(`select a, b, c from t`)).toStrictEqual({});
  });

  it('Test sql query with where condition', () => {
    const parser = new SQLParser();
    expect(parser.parseSql(`select * from t WHERE title = 'this is title'`)).toStrictEqual({ title: 'this is title' });
    expect(parser.parseSql(`select * from t WHERE date = "2021-08-10"`)).toStrictEqual({ date: new Date("2021-08-10") });
    expect(parser.parseSql(`select * from t where number = 123`)).toStrictEqual({ number: 123 });
    expect(parser.parseSql(`select * from t WHERE number = 123.456`)).toStrictEqual({ number: 123.456 });
    expect(parser.parseSql(`select * from t where number > 456.231`)).toStrictEqual({ number: { $gt: 456.231 } });
    expect(parser.parseSql(`select * from t WHERE number < 123`)).toStrictEqual({ number: { $lt: 123 } });
    expect(parser.parseSql(`select * from t where number >= 100.123`)).toStrictEqual({ number: { $gte: 100.123 } });
    expect(parser.parseSql(`select * from t WHERE number <= 12.123`)).toStrictEqual({ number: { $lte: 12.123 } });
    expect(parser.parseSql(`select * from t WHERE number <> 1`)).toStrictEqual({ number: { $ne: 1 } });
    expect(parser.parseSql(`select * from t where number != 1.1`)).toStrictEqual({ number: { $ne: 1.1 } });
    expect(parser.parseSql(`select * from t where boolean = true`)).toStrictEqual({ boolean: true });
    expect(parser.parseSql(`select * from t WHERE boolean = false`)).toStrictEqual({ boolean: false });
    expect(parser.parseSql(`select * from t WHERE title is null`)).toStrictEqual({ title: null });
    expect(parser.parseSql(`select * from t where title is not null`)).toStrictEqual({ title: { $ne: null } });
    expect(parser.parseSql(`WHERE a != b`)).toStrictEqual({ $expr: { $ne: ["$a", "$b"] } });
    expect(parser.parseSql(`WHERE a <> b`)).toStrictEqual({ $expr: { $ne: ["$a", "$b"] } });
    expect(parser.parseSql(`WHERE a = b`)).toStrictEqual({ $expr: { $eq: ["$a", "$b"] } });
    expect(parser.parseSql(`WHERE a > b`)).toStrictEqual({ $expr: { $gt: ["$a", "$b"] } });
    expect(parser.parseSql(`WHERE a < b`)).toStrictEqual({ $expr: { $lt: ["$a", "$b"] } });
    expect(parser.parseSql(`WHERE a >= b`)).toStrictEqual({ $expr: { $gte: ["$a", "$b"] } });
    expect(parser.parseSql(`WHERE a <= b`)).toStrictEqual({ $expr: { $lte: ["$a", "$b"] } });
    expect(parser.parseSql(`WHERE name in (null, 'a%bcd')`)).toStrictEqual({ name: { $in: [null, "a%bcd"] } });
    expect(parser.parseSql(`WHERE name not in (null, 'a%bcd')`)).toStrictEqual({ name: { $nin: [null, "a%bcd"] } });
    expect(parser.parseSql(`select a as b from t where a = 1`)).toStrictEqual({ a: 1 });
    expect(parser.parseSql(`where date between "2021-08-10" and "2021-08-11"`)).toStrictEqual(
      { date: { "$gte": new Date("2021-08-10"), "$lte": new Date("2021-08-11") } }
    );
    expect(parser.parseSql(`where date between '2021-08-10' and '2021-08-11'`)).toStrictEqual(
      { date: { "$gte": '2021-08-10', "$lte": '2021-08-11' } }
    );
    expect(parser.parseSql(`where date not between "2021-08-10" and "2021-08-11"`)).toStrictEqual(
      { date: { $not: { "$gte": new Date("2021-08-10"), "$lte": new Date("2021-08-11") } } }
    );
  });

  // todo: support system function
  it.skip('Test sql query with system function', () => {
    const parser = new SQLParser();
    expect(parser.parseSql(`where date between "2021-08-10" and current_date()`)).toStrictEqual(
      { date: { $not: { "$gte": new Date("2021-08-10"), "$lte": new Date() } } }
    );
  });
});
