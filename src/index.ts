// eslint-disable-next-line import/no-extraneous-dependencies
import { FilterQuery } from 'mongoose';

import { SQLAST, WhereCondition, QueryConditon } from './types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const parser = require('sqlite-parser');

const SQLPREFIX = 'SELECT * FROM SOMETABLE';

const CONDITION_OPERATORS = ['and', 'or'];

// const OPERATOR = ['and', 'or', 'like', 'not like', 'in', 'not in', 'between', 'not between', 'is', 'is not', '>', '<', '>=', '<=', '!='];

const generateMongoQuery = (whereConditon: WhereCondition): any => {
  let { operation, left, right } = whereConditon;
  operation = operation?.toLowerCase();

  if (operation === '=' && left.name) {
    return { [left.name]: right.value };
  }

  if (right && left) {
    if (CONDITION_OPERATORS.indexOf(operation) > -1) {
      return { [`$${operation}`]: [ generateMongoQuery(left), generateMongoQuery(right) ]}
    }
  } 
};

const processSqlAst = (ast: SQLAST): FilterQuery<QueryConditon> => {
  const { where } = ast.statement[0];
  const result = generateMongoQuery(where[0]);
  console.log(`db.postmessages.find(${JSON.stringify(result)})`);
  return result || {};
};

export const parseSQLWhereConditon = (sqlWhereConditon: string): FilterQuery<QueryConditon> => {
  sqlWhereConditon = sqlWhereConditon.trim();
  if (sqlWhereConditon.match(/^where\s.*/i)) {
    let sqlAst: SQLAST;
    try {
      sqlAst = parser(`${SQLPREFIX} ${sqlWhereConditon}`);
    } catch (error) {
      console.log(error.message);
      throw new Error('Invalid SQL where condition, Please check your SQL where condition statement.');
    }
    return processSqlAst(sqlAst);
  } else {
    throw new Error('Invalid SQL where condition, Please check your SQL where condition statement.');
  }
};

const sqlWhereConditon = `
      WHERE title = 'Land of the midnight sun' and title = 'Mangrove trees' 
      or message = 'copyright: Seljalandsfoss waterfall in the South Region of Iceland (© Tom Mackie/plainpicture)'`;
parseSQLWhereConditon(sqlWhereConditon);