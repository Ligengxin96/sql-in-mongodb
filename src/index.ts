import { FilterQuery } from 'mongoose';
import { Parser } from 'node-sql-parser';

import { SQLAst } from './types/SQLAst';
import { MongoQuery } from './types/MongoQuery';
import { Option, RightSubConditionValue } from './types/Common';
import { Where, WhereLeftSubCondition, WhereRightSubCondition } from './types/Where';

const SQLPREFIX = 'SELECT * FROM SOMETABLE';

const CONDITION_OPERATORS = ['and', 'or'];

const DEFAULT_OPTIONS: Option = {
  enableExec: false,
}

class SQLParser {
  parser: Parser;
  option: Option
  constructor(option?: Option) {
    this.parser = new Parser();
    // Todo enable exec: don't return mongoQuery run the query direactly 
    this.option = option || DEFAULT_OPTIONS;
  }

  private processRightValue(right: WhereRightSubCondition): RightSubConditionValue {
    const { value, type } = right;
    if (type === 'number') {
      return Number(value);
    }
    if (type === 'bool') {
      return Boolean(value);
    }
    if (type === 'null') {
      return null;
    }
    return String(value);
  }

  private processLikeOperator(left: WhereLeftSubCondition, right: WhereRightSubCondition): FilterQuery<MongoQuery> {
    const { column } = left;
    let { value } = right;
    let valueStr = String(value);
    let prefix = '';
    let suffix = '';

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
    valueStr = valueStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const values = valueStr.split('/%');
    const finalyValues = values.map((val) => {
      while (val.indexOf('%%') > -1) {
        val = val.replace('%%', '%');
      }
      return val.replace(/%/g, '.*');
    });

    let finallyStr = finalyValues.join('%');
    if (/^(\.\*).*(?<!\.\*)$/gi.test(finallyStr)) {
      finallyStr = finallyStr.substr(2);
      suffix = '$'
    }
    if (/^(?!\.\*).*(\.\*)$/gi.test(finallyStr)) {
      finallyStr = finallyStr.substr(0, finallyStr.length - 2);
      prefix = '^';
    }

    return { [column]: { $regex: `${prefix}${finallyStr}${suffix}`, $options: 'i' } };
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
        case 'is not':
          return { [column]: { $ne: this.processRightValue(right as WhereRightSubCondition) } };
        case '>': 
          return { [column]: { $gt: this.processRightValue(right as WhereRightSubCondition) } };
        case '<': 
          return { [column]: { $lt: this.processRightValue(right as WhereRightSubCondition) } };
        case '>=':
          return { [column]: { $gte: this.processRightValue(right as WhereRightSubCondition) } };
        case '<=':
          return { [column]: { $lte: this.processRightValue(right as WhereRightSubCondition) } };
        case 'is':
          return { [column]: this.processRightValue(right as WhereRightSubCondition) };
        case 'like':
          return this.processLikeOperator(left as WhereLeftSubCondition, right as WhereRightSubCondition);
        // todo
        case 'not like':
        case 'in':
        case 'not in':
        case 'between':
        case 'not between':
        case 'is null':
        case 'is not null':
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
          const { where } = sqlAst;
          return this.generateMongoQuery(where);
        } catch (error) {
          console.log(error.message);
          throw error;
        }
      } else {
        throw new Error('Invalid SQL statement, Please check your SQL statement.');
      }
    }
  };
}

export default SQLParser;

