// eslint-disable-next-line import/no-extraneous-dependencies
import { FilterQuery } from 'mongoose';

import { SQLAST, WhereCondition, QueryConditon, WhereLeftSubCondition, WhereRightSubCondition } from './types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const parser = require('sqlite-parser');

const SQLPREFIX = 'SELECT * FROM SOMETABLE';

const CONDITION_OPERATORS = ['and', 'or'];

class SQLParser {

  private processRightValue(right: WhereRightSubCondition): string | number | boolean | Date | null {
    const { value, variant } = right;
    if (variant === 'decimal') {
      return Number(value);
    }
    return String(value);
  }

  private processLikeOperator(left: WhereLeftSubCondition, right: WhereRightSubCondition): FilterQuery<QueryConditon> {
    const { name } = left;
    let { value } = right;
    value = String(value);
    let prefix = '';
    let suffix = '';
    while (value.indexOf('%%') > -1) {
      value = value.replace('%%', '%');
    }
    if (value.startsWith('%')) {
      value = `${value.substr(1)}`;
      if (!value) {
        return { [name]: { $regex: '.*', $options: 'i' } };
      } 
      suffix = '$';
    }
    if (value.endsWith('%') && !value.endsWith('/%')) {
      value = `${value.substr(0, value.length - 1)}`;
      if (!value) {
        return { [name]: { $regex: '.*', $options: 'i' } };
      } 
      prefix = '^';
    }
    return { [name]: { $regex: `${prefix}${value}${suffix}`.replace(/%/g, '.*'), $options: 'i' } };
  }

  private generateMongoQuery = (whereConditon: WhereCondition): FilterQuery<QueryConditon> => {
    let { operation, left, right } = whereConditon;

    if (left.name) {
      const { name } = left; 
      switch (operation?.toLowerCase()) {
        case '=':
          return { [name]: this.processRightValue(right as WhereRightSubCondition) };
        case '!=':
        case '<>':
          return { [name]: { $ne: this.processRightValue(right as WhereRightSubCondition) } };
        case '>': 
          return { [name]: { $gt: this.processRightValue(right as WhereRightSubCondition) } };
        case '<': 
          return { [name]: { $lt: this.processRightValue(right as WhereRightSubCondition) } };
        case '>=':
          return { [name]: { $gte: this.processRightValue(right as WhereRightSubCondition) } };
        case '<=':
          return { [name]: { $lte: this.processRightValue(right as WhereRightSubCondition) } };
        case 'like':
          return this.processLikeOperator(left as WhereLeftSubCondition, right as WhereRightSubCondition);
        case 'not like':
          return {};
        default:
          return {}
      }
    }

    if (right && left) {
      if (CONDITION_OPERATORS.indexOf(operation) > -1) {
        return { [`$${operation}`]: [this.generateMongoQuery(left as WhereCondition), this.generateMongoQuery(right as WhereCondition)] }
      }
    }

    return {};
  };

  public parseSql = (sqlQuery: string): FilterQuery<QueryConditon> => {
    sqlQuery = sqlQuery.trim();
    let sqlAst: SQLAST;

    if (/^where\s.*/gmi.test(sqlQuery)) {
      sqlQuery = `${SQLPREFIX} ${sqlQuery}`;
    }

    if (/^select\s.*\sfrom\s\w+$/gmi.test(sqlQuery)) {
      try {
        parser(sqlQuery);
        return {};
      } catch (error) {
        throw error;
      }
    } else {
      if (/^select\s.*\sfrom\s.*\swhere\s.*/gmi.test(sqlQuery)) {
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
    }
  };
}

export default SQLParser;
