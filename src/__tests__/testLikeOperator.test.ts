import SQLParser from '../index';

describe('Test like operator', () => {
  it('Test statement with %', () => {
    const parser = new SQLParser();
    expect(parser.parseSql(`WHERE title like '%trees'`)).toStrictEqual({ title: { $regex: "trees$", $options: "i" } });
    expect(parser.parseSql(`WHERE title not like '%trees'`)).toStrictEqual({ title: { $not: new RegExp('trees$', 'i') } });
    expect(parser.parseSql(`WHERE title like 'Mangrove%'`)).toStrictEqual({ title: { $regex: "^Mangrove", $options: "i" } });
    expect(parser.parseSql(`WHERE title not like 'Mangrove%'`)).toStrictEqual({ title: { $not: new RegExp('^Mangrove', 'i') } });
    expect(parser.parseSql(`WHERE title like 'Mangrove%trees'`)).toStrictEqual({ title: { $regex: "Mangrove.*trees", $options: "i" } });
    expect(parser.parseSql(`WHERE title not like 'Mangrove%trees'`)).toStrictEqual({ title: { $not: new RegExp('Mangrove.*trees', 'i') } });
    expect(parser.parseSql(`WHERE title like 'Mangrove%trees%'`)).toStrictEqual({ title: { $regex: "^Mangrove.*trees", $options: "i" } });
    expect(parser.parseSql(`WHERE title not like 'Mangrove%trees%'`)).toStrictEqual({ title: { $not: new RegExp('^Mangrove.*trees', 'i') } });
    expect(parser.parseSql(`WHERE title like '%Mangrove%trees'`)).toStrictEqual({ title: { $regex: "Mangrove.*trees$", $options: "i" } });
    expect(parser.parseSql(`WHERE title not like '%Mangrove%trees'`)).toStrictEqual({ title: { $not: new RegExp('Mangrove.*trees$', 'i') } });
    expect(parser.parseSql(`WHERE title like '%Mangrove%trees%'`)).toStrictEqual({ title: { $regex: ".*Mangrove.*trees.*", $options: "i" } });
    expect(parser.parseSql(`WHERE title not like '%Mangrove%trees%'`)).toStrictEqual({ title: { $not: new RegExp('.*Mangrove.*trees.*', 'i') } });
    expect(parser.parseSql(`WHERE (title like "node%" and name = "deno") or a = 1 and b = 2`)).toStrictEqual(
      { "$or": [{ "$and": [{ "title": { "$regex": "^node", "$options": "i" } }, { "name": "deno" }] }, { "$and": [{ "a": 1 }, { "b": 2 }] }] }
    );
  });

  it('Test statement with mutiple %', async () => {
    const parser = new SQLParser();
    expect(parser.parseSql(`WHERE title like '%'`)).toStrictEqual({ title: { $regex: ".*", $options: "i" } });
    expect(parser.parseSql(`WHERE title like '%%'`)).toStrictEqual({ title: { $regex: ".*", $options: "i" } });
    expect(parser.parseSql(`WHERE title like '%%%'`)).toStrictEqual({ title: { $regex: ".*", $options: "i" } });
    expect(parser.parseSql(`WHERE title like '%%%%'`)).toStrictEqual({ title: { $regex: ".*", $options: "i" } });
    expect(parser.parseSql(`WHERE title like '%%Mangrove%%%trees%%%%'`)).toStrictEqual({ title: { $regex: ".*Mangrove.*trees.*", $options: "i" } });
  });

  it('Test statement with /%', async () => {
    const parser = new SQLParser();
    expect(parser.parseSql(`WHERE title like '/%'`)).toStrictEqual({ title: { $regex: "%", $options: "i" } });
    expect(parser.parseSql(`WHERE title like '/%%/%'`)).toStrictEqual({ title: { $regex: "%.*%", $options: "i" } });
    expect(parser.parseSql(`WHERE title like 'trees/%'`)).toStrictEqual({ title: { $regex: "trees%", $options: "i" } });
    expect(parser.parseSql(`WHERE title like '/%trees'`)).toStrictEqual({ title: { $regex: "%trees", $options: "i" } });
    expect(parser.parseSql(`WHERE title like '/%Man%trees/%'`)).toStrictEqual({ title: { $regex: "%Man.*trees%", $options: "i" } });
    expect(parser.parseSql(`WHERE title like '%%Man/%%%trees%%%%'`)).toStrictEqual({ title: { $regex: ".*Man%.*trees.*", $options: "i" } });
    expect(parser.parseSql(`WHERE title like '/%%Man/%/%%trees%%/%%'`)).toStrictEqual({ title: { $regex: "^%.*Man%%.*trees.*%", $options: "i" } });
    expect(parser.parseSql(`WHERE title like '%/%%/%%'`)).toStrictEqual({ title: { $regex: ".*%.*%.*", $options: "i" } });
  });

  it('Test statement with special characters', async () => {
    const parser = new SQLParser();
    expect(parser.parseSql(`WHERE name like 'abc?%'`)).toStrictEqual({ "name": { $regex: "^abc\\?", $options: "i" } });
    expect(parser.parseSql(`WHERE name like 'a\\%'`)).toStrictEqual({ "name": { $regex: "^a\\\\", $options: "i" } });
    expect(parser.parseSql(`WHERE name like '%$, (, ), *, +, ., [, ], ?, \\, ^, {, }, |%'`)).toStrictEqual({ "name": { $regex: ".*\\$, \\(, \\), \\*, \\+, \\., \\[, \\], \\?, \\\\, \\^, \\{, \\}, \\|.*", $options: "i" } })
  });
});

