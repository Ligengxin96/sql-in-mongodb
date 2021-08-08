import SQLParser from '../../index';

describe('Test base case', () => {
  it('Test null statement', () => {
    try {
      const sqlWhereConditon = '';
      const parser = new SQLParser();
      parser.parseSql(sqlWhereConditon);
    } catch (error) {
      expect(error.message).toStrictEqual('Invalid SQL statement, Please check your SQL statement.');
    }
  });

  it('Test error where statement', () => {
    try {
      const sqlWhereConditon = 'WHERE error = ';
      const parser = new SQLParser();
      parser.parseSql(sqlWhereConditon);
    } catch (error) {
      expect(error.message).toStrictEqual(`Expected "#", "$", "'", "(", "+", "-", "--", "/*", ":", "?", "@", "@@", "AVG", "BINARY", "CASE", "CAST", "COUNT", "CURRENT_DATE", "CURRENT_TIME", "CURRENT_TIMESTAMP", "CURRENT_USER", "DATE", "DATETIME", "FALSE", "INTERVAL", "MAX", "MIN", "NULL", "SESSION_USER", "SUM", "SYSTEM_USER", "TIME", "TIMESTAMP", "TRUE", "USER", "X", "\\\"", "\`", [ \\t\\n\\r], [0-9], or [A-Za-z_] but end of input found.`);
    }
  });

  it('Test simple wrong sql query', () => {
    try {
      const sqlQuery = `select from t WHERE title = 'error'`;
      const parser = new SQLParser();
      parser.parseSql(sqlQuery)
    } catch (error) {
      expect(error.message).toStrictEqual('Invalid SQL statement, Please check your SQL statement.');
    }
  });

  it('Test simple sql query', () => {
    const sqlQuery = `select * from t`;
    const parser = new SQLParser();
    expect(parser.parseSql(sqlQuery)).toStrictEqual({});
  });

  it('Test simple sql query with where condition', () => {
    const parser = new SQLParser();
    expect(parser.parseSql(`select * from t WHERE title = 'this is title'`)).toStrictEqual({ title: 'this is title' });
    expect(parser.parseSql(`select * from t WHERE number = 123`)).toStrictEqual({ number: 123 });
    expect(parser.parseSql(`select * from t WHERE number = 123.456`)).toStrictEqual({ number: 123.456 });
    expect(parser.parseSql(`select * from t WHERE number > 456.231`)).toStrictEqual({ number: { $gt: 456.231 } });
    expect(parser.parseSql(`select * from t WHERE number < 123`)).toStrictEqual({ number: { $lt: 123 } });
    expect(parser.parseSql(`select * from t WHERE number >= 100.123`)).toStrictEqual({ number: { $gte: 100.123 } });
    expect(parser.parseSql(`select * from t WHERE number <= 12.123`)).toStrictEqual({ number: { $lte: 12.123 } });
    expect(parser.parseSql(`select * from t WHERE number <> 1`)).toStrictEqual({ number: { $ne: 1 } });
    expect(parser.parseSql(`select * from t WHERE number != 1.1`)).toStrictEqual({ number: { $ne: 1.1 } });
    expect(parser.parseSql(`select * from t WHERE boolean = true`)).toStrictEqual({ boolean: true });
    expect(parser.parseSql(`select * from t WHERE boolean = false`)).toStrictEqual({ boolean: false });
    expect(parser.parseSql(`select * from t WHERE title is null`)).toStrictEqual({ title: null });
    expect(parser.parseSql(`select * from t WHERE title is not null`)).toStrictEqual({ title: { $ne: null } });

  });


  it('Test simple where statement', () => {
    const sqlWhereConditon = `WHERE title = 'Land of the midnight sun'`;
    const parser = new SQLParser();
    expect(parser.parseSql(sqlWhereConditon)).toStrictEqual({ title: 'Land of the midnight sun' });
  });

  it('Test simple where statement with and', () => {
    const parser = new SQLParser();
    expect(parser.parseSql(`WHERE title = 'Land of the midnight sun' and title = '123'`)).toStrictEqual({ 
      $and: 
        [
          { title: 'Land of the midnight sun' }, 
          { title: '123' }
        ]
      });
    expect(parser.parseSql(`select * from t WHERE title is null and title is not null`)).toStrictEqual({ 
      $and: 
        [
          { title: null }, 
          { title: { $ne: null } }
        ]
      });
      expect(parser.parseSql(`select * from t WHERE title = '123' and title is not null`)).toStrictEqual({ 
        $and: 
          [
            { title: '123' }, 
            { title: { $ne: null } }
          ]
        });
  });

  it('Test simple where statement with or', () => {
    const sqlWhereConditon = `WHERE title = 'Land of the midnight sun' or title = 'Mangrove trees'`;
    const parser = new SQLParser();
    expect(parser.parseSql(sqlWhereConditon)).toStrictEqual({ $or: [{ title: 'Land of the midnight sun' }, { title: 'Mangrove trees' }] });
  });

  it('Test simple where statement with and && or', async () => {
    const sqlWhereConditon = `
      WHERE title = 'Land of the midnight sun' and title = 'Mangrove trees' 
      or message = 'copyright: Seljalandsfoss waterfall in the South Region of Iceland (© Tom Mackie/plainpicture)'`;
    const parser = new SQLParser();
    expect(parser.parseSql(sqlWhereConditon)).toStrictEqual({
      $or:
        [
          { $and:[{ title: "Land of the midnight sun" }, { title: "Mangrove trees" }]},
          { message: "copyright: Seljalandsfoss waterfall in the South Region of Iceland (© Tom Mackie/plainpicture)"}
        ]
    });
  });

  it('Test simple where statement with or && and', async () => {
    const sqlWhereConditon = `
      WHERE title = 'Land of the midnight sun' or title = 'Mangrove trees' 
      and message = 'copyright: Seljalandsfoss waterfall in the South Region of Iceland (© Tom Mackie/plainpicture)'`;
    const parser = new SQLParser();
    expect(parser.parseSql(sqlWhereConditon)).toStrictEqual({ 
      $or: 
        [{ title :"Land of the midnight sun"},{
          $and:[
            { title: "Mangrove trees"},
            { message :"copyright: Seljalandsfoss waterfall in the South Region of Iceland (© Tom Mackie/plainpicture)"}
          ]
        }]
      });
  });

  it('Test simple where statement with duplicate and && or conditon', async () => {
    const sqlWhereConditon = `
      WHERE title = 'Land of the midnight sun' and title = 'Land of the midnight sun'
      or title = 'Mangrove trees' or title = 'Mangrove trees'`;
    const parser = new SQLParser();
    expect(parser.parseSql(sqlWhereConditon)).toStrictEqual({
      $or: 
        [{ $or: 
          [{
            $and: [
              { title: "Land of the midnight sun" },
              { title: "Land of the midnight sun" }
            ]},
            {title:"Mangrove trees"}
          ]},
          {title:"Mangrove trees"}
        ]
    });
  });

  it('Test simple where statement with and && or, brackets', async () => {
    const sqlWhereConditon = `
      WHERE title = 'Land of the midnight sun' 
      and (message = 'copyright: Seljalandsfoss waterfall in the South Region of Iceland (© Tom Mackie/plainpicture)' 
      or title = 'Mangrove trees')`;
    const parser = new SQLParser();
    expect(parser.parseSql(sqlWhereConditon)).toStrictEqual({
      $and: [
        { title: "Land of the midnight sun"},{
          $or: [
            { message: "copyright: Seljalandsfoss waterfall in the South Region of Iceland (© Tom Mackie/plainpicture)"},
            { title: "Mangrove trees"}
          ]
      }]});
  });

  it('Test simple where statement with and,brackets && or', async () => {
    const sqlWhereConditon = `
      WHERE (title = 'Land of the midnight sun' 
      and message = 'copyright: Seljalandsfoss waterfall in the South Region of Iceland (© Tom Mackie/plainpicture)') 
      or title = 'Mangrove trees'`;
    const parser = new SQLParser();
    expect(parser.parseSql(sqlWhereConditon)).toStrictEqual({
      $or: [{
          $and: [
            { title: "Land of the midnight sun"},
            { message: "copyright: Seljalandsfoss waterfall in the South Region of Iceland (© Tom Mackie/plainpicture)"},
          ]
        }, 
          { title: "Mangrove trees"},
      ]});
  });
});
