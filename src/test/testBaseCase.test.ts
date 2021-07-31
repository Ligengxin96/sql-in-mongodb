/* eslint-disable import/no-extraneous-dependencies */
import { FilterQuery } from 'mongoose';
import { QueryConditon } from '../types';
import { parserSQLWhereConditon } from '../index';

describe('Test base case', () => {
  it('Test simple select statement', () => {
    const sqlWhereConditon = `WHERE title = 'Land of the midnight sun'`;
    const queryConditon: FilterQuery<QueryConditon> = parserSQLWhereConditon(sqlWhereConditon);
    expect(queryConditon).toStrictEqual({ $and: [{ title: 'Land of the midnight sun' }] });
  });
});
