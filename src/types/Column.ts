import { ExpressionType } from './Common';

export type Column = {
  as: string,
  expr: {
    type: ExpressionType,
    table: string,
    column: string,
  }
}
