import { ExpressionType } from './Common';

export type WhereConditionDataType = 'single_quote_string' | 'number' | 'bool';

export type WhereLeftSubCondition = {
  type: ExpressionType;
  column: string;
  table: string;
}

export type WhereRightSubCondition = {
  type: WhereConditionDataType;
  value: string | number | boolean | Date | null;
}

export type Where = {
  type: ExpressionType;
  operator: string;
  left: Where | WhereLeftSubCondition;
  right: Where | WhereRightSubCondition;
}