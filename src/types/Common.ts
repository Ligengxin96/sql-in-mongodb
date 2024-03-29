export type ExpressionType = 'binary_expr' | 'column_ref' | 'function' | 'expr_list';
export type RightSubConditionValue = string | number | boolean | Date | null;
export type Database = 'mysql' | 'transactsql' | 'oracle' | 'postgresql';

export type Option = {
  likeOpsCaseSensitive?: boolean,
  multipleLineSql?: boolean,
  database?: Database,
}