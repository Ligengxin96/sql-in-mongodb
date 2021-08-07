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
      expect(error.message).toStrictEqual('Syntax error found near Column Identifier (WHERE Clause)');
    }
  });

  it('Test simple where statement', () => {
    const sqlWhereConditon = `WHERE title = 'Land of the midnight sun'`;
    const parser = new SQLParser();
    expect(parser.parseSql(sqlWhereConditon)).toStrictEqual({ title: 'Land of the midnight sun' });
  });

  it('Test simple where statement with and', () => {
    const sqlWhereConditon = `WHERE title = 'Land of the midnight sun' and title = '123'`;
    const parser = new SQLParser();
    expect(parser.parseSql(sqlWhereConditon)).toStrictEqual({ $and: [{ title: 'Land of the midnight sun' }, { title: '123' }] });
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
