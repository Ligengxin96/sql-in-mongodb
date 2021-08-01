/* eslint-disable import/no-extraneous-dependencies */
import { parserSQLWhereConditon } from '../../index';

describe('Test base case', () => {
  it('Test error select statement', () => {
    const sqlWhereConditon = `WHERE error = `;
    try {
      parserSQLWhereConditon(sqlWhereConditon);
    } catch (error) {
      expect(error.message).toStrictEqual('Invalid SQL where condition, Please check your SQL where condition statement.');
    }
  });

  it('Test simple select statement', () => {
    const sqlWhereConditon = `WHERE title = 'Land of the midnight sun'`;
    const queryConditon = parserSQLWhereConditon(sqlWhereConditon);
    expect(queryConditon).toStrictEqual({ title: 'Land of the midnight sun' });
  });

  it('Test simple select statement with and', () => {
    const sqlWhereConditon = `WHERE title = 'Land of the midnight sun' and title = '123'`;
    const queryConditon = parserSQLWhereConditon(sqlWhereConditon);
    expect(queryConditon).toStrictEqual({ $and: [{ title: 'Land of the midnight sun' }, { title: '123' }] });
  });

  it('Test simple select statement with or', () => {
    const sqlWhereConditon = `WHERE title = 'Land of the midnight sun' or title = 'Mangrove trees'`;
    const queryConditon = parserSQLWhereConditon(sqlWhereConditon);
    expect(queryConditon).toStrictEqual({ $or: [{ title: 'Land of the midnight sun' }, { title: 'Mangrove trees' }] });
  });
});
