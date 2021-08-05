/* eslint-disable import/no-extraneous-dependencies */
import { parseSQLWhereConditon } from '../../index';

describe.skip('Test base case', () => {
  it('Test error select statement', () => {
    const sqlWhereConditon = `WHERE error = `;
    try {
      parseSQLWhereConditon(sqlWhereConditon);
    } catch (error) {
      expect(error.message).toStrictEqual('Invalid SQL where condition, Please check your SQL where condition statement.');
    }
  });

  it('Test simple select statement', () => {
    const sqlWhereConditon = `WHERE title = 'Land of the midnight sun'`;
    const queryConditon = parseSQLWhereConditon(sqlWhereConditon);
    expect(queryConditon).toStrictEqual({ title: 'Land of the midnight sun' });
  });

  it('Test simple select statement with and', () => {
    const sqlWhereConditon = `WHERE title = 'Land of the midnight sun' and title = '123'`;
    const queryConditon = parseSQLWhereConditon(sqlWhereConditon);
    expect(queryConditon).toStrictEqual({ $and: [{ title: 'Land of the midnight sun' }, { title: '123' }] });
  });

  it('Test simple select statement with or', () => {
    const sqlWhereConditon = `WHERE title = 'Land of the midnight sun' or title = 'Mangrove trees'`;
    const queryConditon = parseSQLWhereConditon(sqlWhereConditon);
    expect(queryConditon).toStrictEqual({ $or: [{ title: 'Land of the midnight sun' }, { title: 'Mangrove trees' }] });
  });

  it('Test simple select statement with and & or', async () => {
    const sqlWhereConditon = `
      WHERE title = 'Land of the midnight sun' or title = 'Mangrove trees' 
      and message = 'copyright: Seljalandsfoss waterfall in the South Region of Iceland (© Tom Mackie/plainpicture)'`;
    const queryConditon = parseSQLWhereConditon(sqlWhereConditon);
    expect(queryConditon).toStrictEqual(
      {$and:[{"message":"copyright: Seljalandsfoss waterfall in the South Region of Iceland (© Tom Mackie/plainpicture)"}],
      $or:[{title:"Land of the midnight sun"},{title:"Mangrove trees"}]
    });
  });

  it('Test simple select statement with duplicate and & or conditon', async () => {
    const sqlWhereConditon = `
      WHERE title = 'Land of the midnight sun' and title = 'Land of the midnight sun'
      or title = 'Mangrove trees' or title = 'Mangrove trees'`;
    const queryConditon = parseSQLWhereConditon(sqlWhereConditon);
    expect(queryConditon).toStrictEqual({ $or: [{ title: 'Land of the midnight sun' }, { title: 'Mangrove trees' }] });
  });
});
