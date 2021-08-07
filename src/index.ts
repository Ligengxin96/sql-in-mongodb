import { FilterQuery } from 'mongoose';
import { Parser } from 'node-sql-parser';

import { SQLAst } from './types/SQLAst';
import { MongoQuery } from './types/MongoQuery';
import { Where, WhereLeftSubCondition, WhereRightSubCondition } from './types/Where';

const SQLPREFIX = 'SELECT * FROM SOMETABLE';

const CONDITION_OPERATORS = ['and', 'or'];

class SQLParser {
  parser: Parser;
  constructor() {
    this.parser = new Parser();
  }

  private processRightValue(right: WhereRightSubCondition): string | number | boolean | Date | null {
    const { value, type } = right;
    if (type === 'number') {
      return Number(value);
    }
    if (type === 'bool') {
      return Boolean(value);
    }
    return String(value);
  }

  private processLikeOperator(left: WhereLeftSubCondition, right: WhereRightSubCondition): FilterQuery<MongoQuery> {
    const { column } = left;
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
        return { [column]: { $regex: '.*', $options: 'i' } };
      } 
      suffix = '$';
    }
    if (value.endsWith('%') && !value.endsWith('/%')) {
      value = `${value.substr(0, value.length - 1)}`;
      if (!value) {
        return { [column]: { $regex: '.*', $options: 'i' } };
      } 
      prefix = '^';
    }
    return { [column]: { $regex: `${prefix}${value}${suffix}`.replace(/%/g, '.*'), $options: 'i' } };
  }

  private generateMongoQuery = (whereConditon: Where): FilterQuery<MongoQuery> => {
    let { operator } = whereConditon;
    const { left, right } = whereConditon;
    operator = operator?.toLowerCase();
    const { column } = left as WhereLeftSubCondition;
    if (column) {
      switch (operator) {
        case '=':
          return { [column]: this.processRightValue(right as WhereRightSubCondition) };
        case '!=':
        case '<>':
          return { [column]: { $ne: this.processRightValue(right as WhereRightSubCondition) } };
        case '>': 
          return { [column]: { $gt: this.processRightValue(right as WhereRightSubCondition) } };
        case '<': 
          return { [column]: { $lt: this.processRightValue(right as WhereRightSubCondition) } };
        case '>=':
          return { [column]: { $gte: this.processRightValue(right as WhereRightSubCondition) } };
        case '<=':
          return { [column]: { $lte: this.processRightValue(right as WhereRightSubCondition) } };
        case 'like':
          return this.processLikeOperator(left as WhereLeftSubCondition, right as WhereRightSubCondition);
        case 'not like':
          return {};
        default:
          return {}
      }
    }

    if (right && left) {
      if (CONDITION_OPERATORS.indexOf(operator) > -1) {
        return { [`$${operator}`]: [this.generateMongoQuery(left as Where), this.generateMongoQuery(right as Where)] }
      }
    }

    return {};
  };

  public parseSql = (sqlQuery: string): FilterQuery<MongoQuery> => {
    sqlQuery = sqlQuery.trim();
    let sqlAst: SQLAst;

    if (/^where\s.*/gmi.test(sqlQuery)) {
      sqlQuery = `${SQLPREFIX} ${sqlQuery}`;
    }

    if (/^select\s.*\sfrom\s\w+$/gmi.test(sqlQuery)) {
      try {
        this.parser.astify(sqlQuery);
        return {};
      } catch (error) {
        throw error;
      }
    } else {
      if (/^select\s.*\sfrom\s.*\swhere\s.*/gmi.test(sqlQuery)) {
        try {
          sqlAst = this.parser.astify(sqlQuery) as unknown as SQLAst;
        } catch (error) {
          throw error;
        }
        const { where } = sqlAst;
        const mongoQuery = this.generateMongoQuery(where);
        return mongoQuery;
      } else {
        throw new Error('Invalid SQL statement, Please check your SQL statement.');
      }
    }
  };
}

export default SQLParser;
