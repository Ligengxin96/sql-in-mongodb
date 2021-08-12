import SQLParser from '../src/index';

describe('Test customize option', () => {
  it('Test likeOpsCaseSensitive = true', () => {
    const parser = new SQLParser({
      likeOpsCaseSensitive: true
    });
    expect(parser.parseSql(`WHERE title not like '%Mangrove%trees%'`)).toStrictEqual({ title: { $not: new RegExp('.*Mangrove.*trees.*') } });
    expect(parser.parseSql(`WHERE (title like "node%" and name = "deno") or a = 1 and b = 2`)).toStrictEqual(
      { "$or": [{ $and: [{ "title": { $regex: "^node" } }, { name: "deno" }] }, { $and: [{ "a": 1 }, { "b": 2 }] }] }
    );
    expect(parser.parseSql(`WHERE title like '%%Mangrove%%%trees%%%%'`)).toStrictEqual({ title: { $regex: ".*Mangrove.*trees.*" } });
    expect(parser.parseSql(`WHERE title not like '%%Mangrove%%%trees%%%%'`)).toStrictEqual({ title: { $not: new RegExp('.*Mangrove.*trees.*') } });
    expect(parser.parseSql(`WHERE title like '/%%Man/%/%%trees%%/%%'`)).toStrictEqual({ title: { $regex: "^%.*Man%%.*trees.*%" } });
    expect(parser.parseSql(`WHERE title not like '/%%Man/%/%%trees%%/%%'`)).toStrictEqual({ title: { $not: new RegExp('^%.*Man%%.*trees.*%') } });
    expect(parser.parseSql(`WHERE name like '%$, (, ), *, +, ., [, ], ?, \\, ^, {, }, |%'`)).toStrictEqual(
      { name: { $regex: ".*\\$, \\(, \\), \\*, \\+, \\., \\[, \\], \\?, \\\\, \\^, \\{, \\}, \\|.*" } }
    );
    expect(parser.parseSql(`WHERE name not like '%$, (, ), *, +, ., [, ], ?, \\, ^, {, }, |%'`)).toStrictEqual(
      { name: { $not: new RegExp('.*\\$, \\(, \\), \\*, \\+, \\., \\[, \\], \\?, \\\\, \\^, \\{, \\}, \\|.*') } }
    );
  });

  it('Test multipleLineSql = true', () => {
    const parser = new SQLParser({
      multipleLineSql: true
    });

    try {
      expect(parser.parseSql(`
        select * from t WHERE title = 'this is title';
        select * from t WHERE date`
      ));
    } catch (error) {
      expect(error.message).toBe('Invalid SQL statement, Please check your SQL statement where condition.');
    }

    expect(parser.getSelectedFeilds(`
      select a,b from t WHERE title = 'this is title';
      select a,b, c from t WHERE date = "2021-08-10";
      select a,b, c, 1 as d, e as ee from t where number != 1.1`
    )).toStrictEqual([
      { a: 1, b: 1 },
      { a: 1, b: 1, c: 1 },
      { a: 1, b: 1, c: 1, e: 1 }
    ]);

    expect(parser.parseSql(`
      select * from t WHERE title = 'this is title';
      select * from t WHERE date = "2021-08-10";
      select * from t where number = 123;
      select * from t where number > 456.231;
      select * from t WHERE number < 123;
      select * from t where number >= 100.123;
      select * from t WHERE number <= 12.123;
      select * from t WHERE number <> 1;
      select * from t where number != 1.1`
    )).toStrictEqual([
      { title: 'this is title' },
      { date: new Date("2021-08-10") },
      { number: 123 },
      { number: { $gt: 456.231 } },
      { number: { $lt: 123 } },
      { number: { $gte: 100.123 } },
      { number: { $lte: 12.123 } },
      { number: { $ne: 1 } },
      { number: { $ne: 1.1 } }
    ]);
  });
});

