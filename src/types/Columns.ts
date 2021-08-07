import { ExpressionType } from './Common';

export type Columns = { 
  as: string,
  expr: {
    type: ExpressionType,
    table: string,
    column: string,
  }
}
