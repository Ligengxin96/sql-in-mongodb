import { SQLAst } from './SQLAst';
import { ExpressionType, RightSubConditionValue } from './Common';

export type WhereConditionDataType = 'single_quote_string' | 'number' | 'bool' | 'null' | 'string' | 'expr_list';

export type WhereLeftSubCondition = {
  type: ExpressionType;
  column: string;
  table: string;
}

export type WhereRightSubCondition = {
  type: ExpressionType | WhereConditionDataType;
  column?: string;
  value: RightSubConditionValue | SQLAst;
}

export type Where = {
  type: ExpressionType;
  operator: string;
  left: Where | WhereLeftSubCondition;
  right: Where | WhereRightSubCondition | WhereLeftSubCondition;
}