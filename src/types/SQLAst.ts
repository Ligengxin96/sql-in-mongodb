import { Columns } from './Columns';
import { From } from './From';
import { Where } from './Where';

export type SQLAst = {
  columns: Array<Columns>;
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
