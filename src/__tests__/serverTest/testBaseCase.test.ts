/* eslint-disable import/no-extraneous-dependencies */
import { parseSQLWhereConditon } from '../../index';

describe('Test base case', () => {
  it('Test null statement', () => {
    const sqlWhereConditon = '';
    try {
      parseSQLWhereConditon(sqlWhereConditon);
    } catch (error) {
      expect(error.message).toStrictEqual('Invalid SQL where condition, Please check your SQL where condition statement.');
    }
  });

  it('Test error where statement', () => {
    const sqlWhereConditon = `WHERE error = `;
    try {
      parseSQLWhereConditon(sqlWhereConditon);
    } catch (error) {
      expect(error.message).toStrictEqual('Invalid SQL where condition, Please check your SQL where condition statement.');
    }
  });

  it('Test simple where statement', () => {
    const sqlWhereConditon = `WHERE title = 'Land of the midnight sun'`;
    const queryConditon = parseSQLWhereConditon(sqlWhereConditon);
    expect(queryConditon).toStrictEqual({ title: 'Land of the midnight sun' });
  });

  it('Test simple where statement with and', () => {
    const sqlWhereConditon = `WHERE title = 'Land of the midnight sun' and title = '123'`;
    const queryConditon = parseSQLWhereConditon(sqlWhereConditon);
    expect(queryConditon).toStrictEqual({ $and: [{ title: 'Land of the midnight sun' }, { title: '123' }] });
  });

  it('Test simple where statement with or', () => {
    const sqlWhereConditon = `WHERE title = 'Land of the midnight sun' or title = 'Mangrove trees'`;
    const queryConditon = parseSQLWhereConditon(sqlWhereConditon);
    expect(queryConditon).toStrictEqual({ $or: [{ title: 'Land of the midnight sun' }, { title: 'Mangrove trees' }] });
  });

  it('Test simple where statement with and && or', async () => {
    const sqlWhereConditon = `
      WHERE title = 'Land of the midnight sun' and title = 'Mangrove trees' 
      or message = 'copyright: Seljalandsfoss waterfall in the South Region of Iceland (© Tom Mackie/plainpicture)'`;
    const queryConditon = parseSQLWhereConditon(sqlWhereConditon);
    expect(queryConditon).toStrictEqual({
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
    const queryConditon = parseSQLWhereConditon(sqlWhereConditon);
    expect(queryConditon).toStrictEqual({ 
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
    const queryConditon = parseSQLWhereConditon(sqlWhereConditon);
    expect(queryConditon).toStrictEqual({
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
    const queryConditon = parseSQLWhereConditon(sqlWhereConditon);
    expect(queryConditon).toStrictEqual({
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
    const queryConditon = parseSQLWhereConditon(sqlWhereConditon);
    expect(queryConditon).toStrictEqual({
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
