// eslint-disable-next-line import/no-extraneous-dependencies
import { FilterQuery } from 'mongoose';

import { SQLAST, WhereCondition, QueryConditon } from './types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const parser = require('sqlite-parser');

const SQLPREFIX = 'SELECT * FROM SOMETABLE';

const CONDITION_OPERATORS = ['and', 'or'];

// const OPERATOR = ['and', 'or', 'like', 'not like', 'in', 'not in', 'between', 'not between', 'is', 'is not', '>', '<', '>=', '<=', '!='];

const parseWhereCondition = (whereConditon: WhereCondition, conditionStack: string[]) => {
  if (whereConditon == null) {
    return;
  }

  const operator = whereConditon.operation?.toLowerCase();

  if (whereConditon.left) {
    parseWhereCondition(whereConditon.left, conditionStack);
  }

  if (operator != null) {
    if (CONDITION_OPERATORS.indexOf(operator) === -1) {
      conditionStack.push(`${whereConditon.left.name} ${operator} ${whereConditon.right.value}`);
    } else {
      conditionStack.push(operator);
    }
  }

  if (whereConditon.right) {
    parseWhereCondition(whereConditon.right, conditionStack);
  }
};

const filterDuplicateCondition = (conditionStack: string[]) => {
  const map = new Map();
  const duplicateCondition: string[] = [];

  const filteredConditions = conditionStack.filter(item => CONDITION_OPERATORS.indexOf(item) === -1);
  for (let i = 0; i < filteredConditions.length; i++) {
      if (map.has(filteredConditions[i])) {
        duplicateCondition.push(filteredConditions[i]);
      }
      map.set(filteredConditions[i], 1);
  }

  duplicateCondition.forEach((item) => {
    conditionStack.splice(conditionStack.indexOf(item), 2);
  })

  return conditionStack;
}

const processSqlAst = (ast: SQLAST) => {
  const { where } = ast.statement[0];
  const conditionStack: string[] = [];
  parseWhereCondition(where[0], conditionStack);
  return filterDuplicateCondition(conditionStack);
};

export const parserSQLWhereConditon = (sqlWhereConditon: string): FilterQuery<QueryConditon> => {
  sqlWhereConditon = sqlWhereConditon.trim();
  if (sqlWhereConditon.match(/^where\s.*/i)) {
    try {
      const ast: SQLAST = parser(`${SQLPREFIX} ${sqlWhereConditon}`);
      let conditionStack: string[] = [];
      try {
        conditionStack = processSqlAst(ast);
      } catch (error) {
        throw new Error('Invalid SQL where condition, Please check your SQL where condition statement.');
      }

      let queryConditon: FilterQuery<QueryConditon> = { $and: [], $or: [] };

      for (let i = 0, isFirstTime = true; i < conditionStack.length; ) {
        const operatorIndex = conditionStack.findIndex((conditon, index) => index > i && CONDITION_OPERATORS.indexOf(conditon) > -1);
        let isConditionOperatorExist = operatorIndex > -1;

        if (isFirstTime && !isConditionOperatorExist) {
          let [cloumn, value] = conditionStack[0].split('=');
          cloumn = cloumn.trim();
          value = value.trim();
          queryConditon = { [`${cloumn}`]: value };
          break;
        }

        if (isConditionOperatorExist) {
          isConditionOperatorExist = false;
          i = operatorIndex;
          const mongOperator = conditionStack[operatorIndex];

          if (mongOperator != null) {
            if (isFirstTime) {
              let [cloumn, value] = conditionStack[operatorIndex - 1].split('=');
              cloumn = cloumn.trim();
              value = value.trim();
              if (queryConditon[`$${mongOperator}`].indexOf(value) === -1) {
                queryConditon[`$${mongOperator}`]?.push({ [`${cloumn}`]: value });
              }
              isFirstTime = false;
            }

            let [cloumn, value] = conditionStack[operatorIndex + 1].split('=');
            cloumn = cloumn.trim();
            value = value.trim();
            if (queryConditon[`$${mongOperator}`].indexOf(value) === -1) {
              queryConditon[`$${mongOperator}`]?.push({ [`${cloumn}`]: value });
            }
          }
        } else {
          break;
        }
      }

      if (!queryConditon?.$and?.length) {
        delete queryConditon.$and;
      }
      if (!queryConditon?.$or?.length) {
        delete queryConditon.$or;
      }
      console.log('queryConditon', `db.postmessages.find(${JSON.stringify(queryConditon)})`);
      return queryConditon;
    } catch (error) {
      console.log(error.message);
      return {};
    }
  } else {
    throw new Error('Invalid SQL where condition, Please check your SQL where condition statement.');
  }
};

const sqlWhereConditon = `WHERE title = 'Land of the midnight sun' and title = 'Land of the midnight sun' or title = 'Mangrove trees' or title = 'Mangrove trees'`;
parserSQLWhereConditon(sqlWhereConditon);