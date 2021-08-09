import SQLParser from '../../index';

describe('Test like operator', () => {
  it('Test statement with %', () => {
    const parser = new SQLParser();
    expect(parser.parseSql(`WHERE title like '%trees'`)).toStrictEqual({"title":{"$regex":"trees$","$options":"i"}});
    expect(parser.parseSql(`WHERE title like 'Mangrove%'`)).toStrictEqual({"title":{"$regex":"^Mangrove","$options":"i"}});
    expect(parser.parseSql(`WHERE title like 'Mangrove%trees'`)).toStrictEqual({"title":{"$regex":"Mangrove.*trees","$options":"i"}});
    expect(parser.parseSql(`WHERE title like 'Mangrove%trees%'`)).toStrictEqual({"title":{"$regex":"^Mangrove.*trees","$options":"i"}});
    expect(parser.parseSql(`WHERE title like '%Mangrove%trees'`)).toStrictEqual({"title":{"$regex":"Mangrove.*trees$","$options":"i"}});
    expect(parser.parseSql(`WHERE title like '%Mangrove%trees%'`)).toStrictEqual({"title":{"$regex":".*Mangrove.*trees.*","$options":"i"}});
  });

  it('Test statement with mutiple %', async () => {
    const parser = new SQLParser();
    expect(parser.parseSql(`WHERE title like '%'`)).toStrictEqual({"title":{"$regex":".*","$options":"i"}});
    expect(parser.parseSql(`WHERE title like '%%'`)).toStrictEqual({"title":{"$regex":".*","$options":"i"}});
    expect(parser.parseSql(`WHERE title like '%%%'`)).toStrictEqual({"title":{"$regex":".*","$options":"i"}});
    expect(parser.parseSql(`WHERE title like '%%%%'`)).toStrictEqual({"title":{"$regex":".*","$options":"i"}});
    expect(parser.parseSql(`WHERE title like '%%Mangrove%%%trees%%%%'`)).toStrictEqual({"title":{"$regex":".*Mangrove.*trees.*","$options":"i"}});
  });

  it('Test statement with /%', async () => {
    const parser = new SQLParser();
    expect(parser.parseSql(`WHERE title like '/%'`)).toStrictEqual({"title":{"$regex":"%","$options":"i"}});
    expect(parser.parseSql(`WHERE title like '/%%/%'`)).toStrictEqual({"title":{"$regex":"%.*%","$options":"i"}});
    expect(parser.parseSql(`WHERE title like 'trees/%'`)).toStrictEqual({"title":{"$regex":"trees%","$options":"i"}});
    expect(parser.parseSql(`WHERE title like '/%trees'`)).toStrictEqual({"title":{"$regex":"%trees","$options":"i"}});
    expect(parser.parseSql(`WHERE title like '/%Man%trees/%'`)).toStrictEqual({"title":{"$regex":"%Man.*trees%","$options":"i"}});
    expect(parser.parseSql(`WHERE title like '%%Man/%%%trees%%%%'`)).toStrictEqual({"title":{"$regex":".*Man%.*trees.*","$options":"i"}});
    expect(parser.parseSql(`WHERE title like '/%%Man/%/%%trees%%/%%'`)).toStrictEqual({"title":{"$regex":"^%.*Man%%.*trees.*%","$options":"i"}});
    expect(parser.parseSql(`WHERE title like '%/%%/%%'`)).toStrictEqual({"title":{"$regex":".*%.*%.*","$options":"i"}});
  });

  it('Test statement with special characters', async () => {
    const parser = new SQLParser();
    expect(parser.parseSql(`WHERE name like 'abc?%'`)).toStrictEqual({"name":{"$regex":"^abc\\?","$options":"i"}});
    expect(parser.parseSql(`WHERE name like 'a\\%'`)).toStrictEqual({"name":{"$regex":"^a\\\\","$options":"i"}});
    expect(parser.parseSql(`WHERE name like '%$, (, ), *, +, ., [, ], ?, \\, ^, {, }, |%'`)).toStrictEqual({"name":{"$regex":".*\\$, \\(, \\), \\*, \\+, \\., \\[, \\], \\?, \\\\, \\^, \\{, \\}, \\|.*","$options":"i"}})
  });
});

