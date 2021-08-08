import { Column } from './Column';
import { From } from './From';
import { Where } from './Where';

export type SQLAst = {
  column: Array<Column>;
  distinct: string | null,
  from: Array<From>,
  groupBy: string | null,
  having: string | null, 
  limit: string | null,
  options: string | null,
  orderBy: string | null, 
  table: string,
  where: Where,
  with: string | null,
  'for_update': string | null,
}
