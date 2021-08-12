import SQLParser from '../src/index';

describe('Test or operator', () => {
  it('Test where statement with and && or', async () => {
    const parser = new SQLParser();
    expect(parser.parseSql(`WHERE title = 'Land' and title = 'Mangrove' or message = '© Tom Mackie/plainpicture'`)).toStrictEqual(
      { $or: [{ $and: [{ title: "Land" }, { title: "Mangrove" }] }, { message: "© Tom Mackie/plainpicture" }] }
    );
    expect(parser.parseSql(`WHERE title = 'Land' or title = 'Mangrove' and message = '© Tom Mackie/plainpicture'`)).toStrictEqual(
      { $or: [{ title: "Land" }, { $and: [{ title: "Mangrove" }, { message: "© Tom Mackie/plainpicture" }] }] }
    );
    expect(parser.parseSql(`WHERE title = 'Land' and title = 'Land' or title = 'Mangrove' or title = 'Mangrove'`)).toStrictEqual(
      { $or: [{ $or: [{ $and: [{ title: "Land" }, { title: "Land" }] }, { title: "Mangrove" }] }, { title: "Mangrove" }] }
    );
  });

  it('Test where statement with and && or && brackets', async () => {
    const parser = new SQLParser();
    expect(parser.parseSql(`WHERE title = 'Land' and (message = '(© Tom Mackie/plainpicture)' or title = 'Mangrove')`)).toStrictEqual(
      { $and: [{ title: "Land" }, { $or: [{ message: "(© Tom Mackie/plainpicture)" }, { title: "Mangrove" }] }] }
    );
    expect(parser.parseSql(`WHERE (title = 'Land' and message = '(© Tom Mackie/plainpicture)') or title = 'Mangrove'`)).toStrictEqual(
      { $or: [{ $and: [{ title: "Land" }, { message: "(© Tom Mackie/plainpicture)" } ] }, { title: "Mangrove" }] }
    );
    expect(parser.parseSql(`where (a = 1 or b = 2) and c = 3`)).toStrictEqual({ $and: [{ $or: [{ a: 1 }, { b: 2 }, ] }, { c: 3 }] });
    expect(parser.parseSql(`where (a = 1) or b = 2 and c = 3`)).toStrictEqual({ $or: [{ a: 1 }, { $and: [{ b: 2 }, { c: 3 }] }] });
    expect(parser.parseSql(`where (a = '1' and b = 2) or c = 3`)).toStrictEqual({ $or: [{ $and: [{ a: "1" }, { b: 2 }] }, { c: 3 }] });
    expect(parser.parseSql(`where a = 1 or (b = 2) and c = 3`)).toStrictEqual({ "$or": [{ "a": 1 }, { $and: [{ "b": 2 }, { "c": 3 }] }] });
    expect(parser.parseSql(`where a = 1 or (b = 2 and c = 3) and d = 4`)).toStrictEqual({ "$or": [{ "a": 1 }, { $and: [{ $and: [{ "b": 2 }, { "c": 3 }] }, { "d": 4 }] }] });
    expect(parser.parseSql(`where (a = 1 and b >= 2) or (a = 3 and b <= 4) or (a > 5 or b < 6)`)).toStrictEqual(
      { "$or": [{ "$or": [{ $and: [{ "a": 1 }, { "b": { "$gte": 2 } }] }, { $and: [{ "a": 3 }, { "b": { "$lte": 4 } }] }] }, { "$or": [{ "a": { $gt: 5 } }, { "b": { "$lt": 6 } }] }] }
    );
  });
});
