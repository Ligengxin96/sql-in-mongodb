import SQLParser from '../src/index';

describe('Test and operator', () => {
  it('Test where condition with and operator', () => {
    const parser = new SQLParser();
    expect(parser.parseSql(`WHERE title = 'Land' and title = 'Mangrove'`)).toStrictEqual({ $and: [{ title: 'Land' }, { title: 'Mangrove' }] });
    expect(parser.parseSql(`WHERE a like 'a1' and b = 'b1'`)).toStrictEqual({ $and: [{ a: { $regex: 'a1', $options: 'i' } }, { b: 'b1' }] });
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
    expect(parser.parseSql(`select * from t WHERE title >= 123 and title <= 234`)).toStrictEqual(
      { $and: [{ title: { $gte: 123 } }, { title: { $lte: 234 } }] }
    );
    expect(parser.parseSql(`select * from t WHERE title like '123%' and date between "2021-08-10" and "2021-08-11"`)).toStrictEqual(
      { $and: [{ title: { $regex: "^123", $options: "i" } }, { date: { $gte: new Date("2021-08-10"), $lte: new Date("2021-08-11") } }] }
    );
    expect(parser.parseSql(`select * from t WHERE title in ('1', '2') and id between 1 and 2`)).toStrictEqual(
      { $and: [{ title: { $in: ["1", "2"] } }, { id: { $gte: 1, $lte: 2 } }] }
    );
    expect(parser.parseSql(`
      select * from t WHERE title >= 123 and title <= 234
      and title in ('1', '2') and id between 1 and 2
      and title = '123' and title is not null
    `
    )).toStrictEqual({
        $and:
          [{
            $and:
              [{
                $and:
                  [{
                    $and:
                      [{
                        $and: [
                          { title: { $gte: 123 } },
                          { title: { $lte: 234 } }
                        ]
                      },
                      { title: { $in: ["1", "2"] } }
                      ]
                  },
                  { id: { $gte: 1, $lte: 2 } }]
              }, { title: "123" }
              ]
          },
          { title: { $ne: null } }
          ]
      });
  });
});
