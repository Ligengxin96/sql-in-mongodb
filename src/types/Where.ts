import { ExpressionType, RightSubConditionValue } from './Common';

export type WhereConditionDataType = 'single_quote_string' | 'number' | 'bool' | 'null' | 'string' | 'expr_list';

export type WhereLeftSubCondition = {
  type: ExpressionType;
  column: string;
  table: string;
}

export type WhereRightSubCondition = {
  type: WhereConditionDataType;
  value: RightSubConditionValue;
}

export type Where = {
  type: ExpressionType;
  operator: string;
  left: Where | WhereLeftSubCondition;
  right: Where | WhereRightSubCondition | WhereLeftSubCondition;
}