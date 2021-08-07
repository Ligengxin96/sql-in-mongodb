// eslint-disable-next-line import/no-extraneous-dependencies
import { FilterQuery } from 'mongoose';

import { SQLAST, WhereCondition, QueryConditon } from './types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const parser = require('sqlite-parser');

const SQLPREFIX = 'SELECT * FROM SOMETABLE';

const CONDITION_OPERATORS = ['and', 'or'];

class SQLParser {
  private generateMongoQuery = (whereConditon: WhereCondition): FilterQuery<QueryConditon> => {
    let { operation, left, right } = whereConditon;
  
    if (left.name) {
      switch (operation?.toLowerCase()) {
        case '=': 
          return { [left.name]: right.value };
        case '!=':
        case '<>':
          return { [left.name]: { $ne: right.value } };
        case '>':
          return { [left.name]: { $gt: right.value } };
        case '<':
          return { [left.name]: { $lt: right.value } };
        case '>=': 
          return { [left.name]: { $gte: right.value } };
        case '<=':
          return { [left.name]: { $lte: right.value } };
        case 'like':
          if (right.value && right.value.indexOf('./') > -1 ){
            return { [left.name]: { $regex: right.value.replace('/%', '%'), $options: 'i' } };
          }
          return { [left.name]: { $regex: right.value?.replace('%', '.*'), $options: 'i' } };
        case 'not like':
        default:
          return {}
      }
    }
  
    if (right && left) {
      if (CONDITION_OPERATORS.indexOf(operation) > -1) {
        return { [`$${operation}`]: [this.generateMongoQuery(left), this.generateMongoQuery(right)] }
      }
    }
  
    return {};
  };
  
  public parseSql = (sqlQuery: string): FilterQuery<QueryConditon> => {
    sqlQuery = sqlQuery.trim();
    let sqlAst: SQLAST;

    if (sqlQuery.match(/^where\s.*/i)) {
      sqlQuery = `${SQLPREFIX} ${sqlQuery}`;
    }

    if (sqlQuery.match(/^select\s.*\sfrom\s.*\swhere\s.*/i)) {
      try {
        sqlAst = parser(sqlQuery);
      } catch (error) {
        throw error;
      }
      const { where } = sqlAst.statement[0];
      return this.generateMongoQuery(where[0]);
    } else {
      throw new Error('Invalid SQL statement, Please check your SQL statement.');
    }
  };
}

export default SQLParser;
