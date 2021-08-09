import { FilterQuery } from 'mongoose';
import { Parser } from 'node-sql-parser';

import { SQLAst } from './types/SQLAst';
import { MongoQuery } from './types/MongoQuery';
import { Option, RightSubConditionValue } from './types/Common';
import { Where, WhereLeftSubCondition, WhereRightSubCondition } from './types/Where';

const SQLPREFIX = 'SELECT * FROM SOMETABLE';

const CONDITION_OPERATORS = ['and', 'or'];

const DEFAULT_OPTIONS: Option = {
  likeOpsCaseSensitive: false,
}

class SQLParser {
  parser: Parser;
  option: Option
  constructor(option?: Option) {
    this.parser = new Parser();
    this.option = option || DEFAULT_OPTIONS;
  }

  private processRightValue(right: WhereRightSubCondition): RightSubConditionValue | any {
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
    // todo handle date
    // mongodb sotre date as string so that can use $gte, $lte, $gt, $lt to find data
    return String(value);
  }

  private processLikeOperator(left: WhereLeftSubCondition, right: WhereRightSubCondition, isLike: boolean): FilterQuery<MongoQuery> {
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

    const regexStr = `${prefix}${finallyStr}${suffix}`;

    if (this.option.likeOpsCaseSensitive) {
      return isLike ? { [column]: { $regex: regexStr } } 
                  : { [column]: { $not: new RegExp(regexStr) } };
    }

    return isLike ? { [column]: { $regex: regexStr, $options: 'i' } } 
                  : { [column]: { $not: new RegExp(regexStr, 'i') } };
  }

  private generateMongoQuery = (whereConditon: Where): FilterQuery<MongoQuery> => {
    try {
      let { operator } = whereConditon;
      const { left, right } = whereConditon;
      operator = operator?.toLowerCase();
      const { column: leftColumn, type: leftType } = left as WhereLeftSubCondition;
      const { column: rightColumn, type: rightType } = right as WhereLeftSubCondition;
      if (leftColumn) {
        let isCompareColumn = false;
        if (leftType === rightType && leftType === 'column_ref') {
          isCompareColumn = true;
        }
        switch (operator) {
          case '=':
            if (isCompareColumn) {
              return { $expr: { $eq: [`$${leftColumn}`, `$${rightColumn}`] } };
            }
            return { [leftColumn]: this.processRightValue(right as WhereRightSubCondition) };
          case '!=':
          case '<>':
            if (isCompareColumn) {
              return { $expr: { $ne: [`$${leftColumn}`, `$${rightColumn}`] } };
            }
            return { [leftColumn]: { $ne: this.processRightValue(right as WhereRightSubCondition) } };
          case 'is not':
            return { [leftColumn]: { $ne: this.processRightValue(right as WhereRightSubCondition) } };
          case '>': 
            if (isCompareColumn) {
              return { $expr: { $gt: [`$${leftColumn}`, `$${rightColumn}`] } };
            }
            return { [leftColumn]: { $gt: this.processRightValue(right as WhereRightSubCondition) } };
          case '<': 
            if (isCompareColumn) {
              return { $expr: { $lt: [`$${leftColumn}`, `$${rightColumn}`] } };
            }
            return { [leftColumn]: { $lt: this.processRightValue(right as WhereRightSubCondition) } };
          case '>=':
            if (isCompareColumn) {
              return { $expr: { $gte: [`$${leftColumn}`, `$${rightColumn}`] } };
            }
            return { [leftColumn]: { $gte: this.processRightValue(right as WhereRightSubCondition) } };
          case '<=':
            if (isCompareColumn) {
              return { $expr: { $lte: [`$${leftColumn}`, `$${rightColumn}`] } };
            }
            return { [leftColumn]: { $lte: this.processRightValue(right as WhereRightSubCondition) } };
          case 'is':
            return { [leftColumn]: this.processRightValue(right as WhereRightSubCondition) };
          case 'like':
            return this.processLikeOperator(left as WhereLeftSubCondition, right as WhereRightSubCondition, true);
          case 'not like':
            return this.processLikeOperator(left as WhereLeftSubCondition, right as WhereRightSubCondition, false);
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
    } catch (error) {
      throw error;
    }
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

