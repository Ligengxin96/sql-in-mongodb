import { FilterQuery } from 'mongoose';
import { Parser } from 'node-sql-parser';

import { SQLAst } from './types/SQLAst';
import { MongoQuery } from './types/MongoQuery';
import { Option, RightSubConditionValue } from './types/Common';
import { Where, WhereLeftSubCondition, WhereRightSubCondition } from './types/Where';

const SQLPREFIX = 'SELECT * FROM UNKNOWN';

const CONDITION_OPERATORS = ['and', 'or'];

const DEFAULT_OPTIONS: Option = {
  likeOpsCaseSensitive: false,
  multipleLineSql: false,
  database: 'mysql', // todo support multiple databases
}

class SQLParser {
  parser: Parser;
  option: Option
  constructor(option?: Option) {
    this.parser = new Parser();
    this.option = {...DEFAULT_OPTIONS, ...option};
  }

  private processRightValue(right: WhereRightSubCondition, operator?: string): RightSubConditionValue | any {
    const processDate = (value: { type: string, value: any }): Date | string => {
      const { type, value: valueStr } = value;
      if (type === 'string') {
        const date = new Date(valueStr);
        if (date instanceof Date && !isNaN(date.getTime())) {
          return date;
        }
      }
      return valueStr;
    }

    const { value, type } = right;
    const valueStr = String(value);
    if (type === 'number') {
      return Number(value);
    }
    if (type === 'bool') {
      return Boolean(value);
    }
    if (type === 'null') {
      return null;
    }
    if (type === 'expr_list') {
      if (Array.isArray(value)) {
        if (operator === 'between') {
          return { $gte: processDate(value[0]), $lte: processDate(value[1]) };
        }
        return value.map((v) => v.value);
      }
      return [];
    }
    if (type === 'string') {
      return processDate({ type: 'string', value: valueStr })
    }
    return valueStr;
  }

  private processLikeOperator(left: WhereLeftSubCondition, right: WhereRightSubCondition, isLike: boolean): FilterQuery<MongoQuery> {
    const { column } = left;
    const { value } = right;
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

      if (!operator) {
        throw new Error('Invalid SQL statement, Please check your SQL statement where condition.');
      }
      if (!left && !right && operator) {
        throw new Error(`Operator '${operator}' not currently supported.`);
      }

      operator = operator.toLowerCase();
      const { column: leftColumn, type: leftType } = left as WhereLeftSubCondition;
      const { column: rightColumn, type: rightType, value } = right as WhereRightSubCondition;

      if (rightType === 'expr_list') {
        const exprs: string[] = [];
        try {
          if (Array.isArray(value)){
            value.forEach((v) => {
              if (v.type === 'select') {
                exprs.push(this.parser.sqlify(v));
              }
            });
          }
        } catch (error) {
          throw error;
        }

        if (exprs.length > 0) {
          throw new Error(`The value: '${exprs.join(';')}' on the ${operator.toUpperCase()} operator right is not currently supported.`);
        }
      }

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
            return { [leftColumn]: { $in: this.processRightValue(right as WhereRightSubCondition) } };
          case 'not in':
            return { [leftColumn]: { $nin: this.processRightValue(right as WhereRightSubCondition) } };
          case 'between':
            return { [leftColumn]: this.processRightValue(right as WhereRightSubCondition, 'between') };
          case 'not between':
            return { [leftColumn]: { $not: this.processRightValue(right as WhereRightSubCondition, 'between') } };
          default:
            throw new Error(`Operator '${operator.toUpperCase()}' not currently supported.`);
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

  private preCheckSql = (sqlQuery: string): SQLAst | SQLAst[] => {
    sqlQuery = sqlQuery.trim();
    if (/^where\s.*/gmi.test(sqlQuery)) {
      sqlQuery = `${SQLPREFIX} ${sqlQuery}`;
    }
    if (/^select\s.*\sfrom\s\w+$/gmi.test(sqlQuery) || /^select\s.*\sfrom\s.*\swhere\s.*/gmi.test(sqlQuery)) {
      try {
        const sqlAsts = this.parser.astify(sqlQuery) as unknown as SQLAst | SQLAst[];
        if (this.option.multipleLineSql) {
          return sqlAsts;
        }
        return Array.isArray(sqlAsts) ? sqlAsts[0] : sqlAsts;
      } catch (error) {
        throw error;
      }
    } else {
      throw new Error('Invalid SQL statement or the SQL statement not currently supported.');
    }
  }

  public parseSql = (sqlQuery: string): FilterQuery<MongoQuery> | FilterQuery<MongoQuery>[] => {
    if (!sqlQuery || !sqlQuery.trim()) {
      return {};
    }

    const processAst = (ast: SQLAst): FilterQuery<MongoQuery> => {
      const { where } = ast;
      if (where) {
        return this.generateMongoQuery(where);
      }
      return {};
    }

    const sqlAst = this.preCheckSql(sqlQuery);
    if (sqlAst) {
      if (Array.isArray(sqlAst)) {
        return sqlAst.map(ast => processAst(ast));
      }
      return processAst(sqlAst);
    }
    return {};
  };

  public getSelectedFeilds = (sqlQuery: string): FilterQuery<MongoQuery> | FilterQuery<MongoQuery>[] => {
    if (!sqlQuery || !sqlQuery.trim()) {
      return {};
    }

    const processAst = (ast: SQLAst): FilterQuery<MongoQuery> => {
      const { columns } = ast;
      if (columns === '*') {
        return {};
      }
      if (Array.isArray(columns)) {
        const fileds: FilterQuery<MongoQuery> = {};
        columns.forEach((col) => {
          const { column, type } = col.expr;
          if (type === 'column_ref') {
            fileds[column] = 1;
          }
        });
        return fileds;
      }
      return {};
    }

    const sqlAst = this.preCheckSql(sqlQuery);
    if (sqlAst) {
      if (Array.isArray(sqlAst)) {
        return sqlAst.map(ast => processAst(ast));
      }
      return processAst(sqlAst);
    }
    return {};
  }

  public getSelectedTable = (sqlQuery: string): string | string[] => {
    if (!sqlQuery || !sqlQuery.trim()) {
      return 'UNKNOWN';
    }

    const processAst = (ast: SQLAst): string => {
      const { from } = ast;
      return from[0].table;
    }

    const sqlAst = this.preCheckSql(sqlQuery);
    if (sqlAst) {
      if (Array.isArray(sqlAst)) {
        return sqlAst.map(ast => processAst(ast));
      } else {
        return processAst(sqlAst);
      }
    }
    return 'UNKNOWN';
  }
}

export default SQLParser;