import { SQLAST, WhereCondition, QueryConditon } from './types';
import { FilterQuery } from 'mongoose';

const parser = require('sqlite-parser');

const SQLPREFIX = 'SELECT * FROM SOMETABLE';

const queryConditon: FilterQuery<QueryConditon> = { '$and': [], '$or': [] };

const parseWhereCondition = (whereConditon: WhereCondition, currentCondition = '') => {
  if (!whereConditon.left) {
    return;
  }

  parseWhereCondition(whereConditon.left, currentCondition);
 
  if (whereConditon?.operation && whereConditon?.operation !== '=') {
    console.log(whereConditon.operation);
    currentCondition = whereConditon.operation;
  }
  if (whereConditon?.operation === '=') {
    console.log(whereConditon.left.name, '=', whereConditon.right.value);
    if (currentCondition !== 'or') {
      queryConditon[`$and`]?.push({[`${whereConditon.left.name}`]: whereConditon.right.value});
    } else {
      queryConditon[`$or`]?.push({[`${whereConditon.left.name}`]: whereConditon.right.value});
    }
    currentCondition = '';
  }

  parseWhereCondition(whereConditon.right, currentCondition);
}

const processSqlAst = (ast: SQLAST) => {
  const { where } = ast.statement[0];
  parseWhereCondition(where[0]);
}

export const parserSQLWhereConditon = (sqlWhereConditon: string): FilterQuery<QueryConditon> => {
  if (sqlWhereConditon.match(/^(where)(\s).*/i)) {
    try {
      const ast: SQLAST = parser(`${SQLPREFIX} ${sqlWhereConditon}`);
  
      processSqlAst(ast);
      
      if (!queryConditon?.$and?.length) {
        delete queryConditon.$and;
      }
      if (!queryConditon?.$or?.length) {
        delete queryConditon.$or;
      }
      
      console.log(queryConditon);
      
      return queryConditon;
    } catch (error) {
      throw new Error('Invalid SQL where condition, Please check your SQL where condition statement.');
    }
  } else {
    throw new Error('Invalid SQL where condition, Please check your SQL where condition statement.');
  }
}
