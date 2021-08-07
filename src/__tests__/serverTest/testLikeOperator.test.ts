import SQLParser from '../../index';

describe('Test like operator', () => {
  it('Test simple statement start with like operator', () => {
    const sqlWhereConditon = `WHERE title like '%trees'`;
    const parser = new SQLParser();
    expect(parser.parseSql(sqlWhereConditon)).toStrictEqual({"title":{"$regex":"trees$","$options":"i"}});
  });

  it('Test simple statement end with like operator', () => {
    const sqlWhereConditon = `WHERE title like 'Mangrove%'`;
    const parser = new SQLParser();
    expect(parser.parseSql(sqlWhereConditon)).toStrictEqual({"title":{"$regex":"^Mangrove","$options":"i"}});
  });

  it('Test simple statement end with like operator in middle of the string', async () => {
    const sqlWhereConditon = `WHERE title like 'Mangrove%trees'`;
    const parser = new SQLParser();
    expect(parser.parseSql(sqlWhereConditon)).toStrictEqual({"title":{"$regex":"Mangrove.*trees","$options":"i"}});
  });

  it('Test simple statement with multiple like operator', async () => {
    const parser = new SQLParser();
    expect(parser.parseSql(`WHERE title like 'Mangrove%trees%'`)).toStrictEqual({"title":{"$regex":"^Mangrove.*trees","$options":"i"}});
    expect(parser.parseSql(`WHERE title like '%Mangrove%trees'`)).toStrictEqual({"title":{"$regex":"Mangrove.*trees$","$options":"i"}});
    expect(parser.parseSql(`WHERE title like '%Mangrove%trees%'`)).toStrictEqual({"title":{"$regex":"^Mangrove.*trees$","$options":"i"}});
  });

  it('Test simple statement only like operator', async () => {
    const parser = new SQLParser();
    expect(parser.parseSql(`WHERE title like '%'`)).toStrictEqual({"title":{"$regex":".*","$options":"i"}});
    expect(parser.parseSql(`WHERE title like '%%'`)).toStrictEqual({"title":{"$regex":".*","$options":"i"}});
    expect(parser.parseSql(`WHERE title like '%%%'`)).toStrictEqual({"title":{"$regex":".*","$options":"i"}});
    expect(parser.parseSql(`WHERE title like '%%%%'`)).toStrictEqual({"title":{"$regex":".*","$options":"i"}});
    expect(parser.parseSql(`WHERE title like '%%Mangrove%%%trees%%%%'`)).toStrictEqual({"title":{"$regex":"^Mangrove.*trees$","$options":"i"}});
  });
});
