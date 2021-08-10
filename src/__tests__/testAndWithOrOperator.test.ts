import SQLParser from '../index';

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

  it('Test where statement with and && or, brackets', async () => {
    const parser = new SQLParser();
    expect(parser.parseSql(`WHERE title = 'Land' and (message = '(© Tom Mackie/plainpicture)' or title = 'Mangrove')`)).toStrictEqual(
      { $and: [{ title: "Land" }, { $or: [{ message: "(© Tom Mackie/plainpicture)" }, { title: "Mangrove" }] }] }
    );
    expect(parser.parseSql(`WHERE (title = 'Land' and message = '(© Tom Mackie/plainpicture)') or title = 'Mangrove'`)).toStrictEqual(
      { $or: [{ $and: [{ title: "Land" }, { message: "(© Tom Mackie/plainpicture)" },] }, { title: "Mangrove" }] }
    );
  });
});
