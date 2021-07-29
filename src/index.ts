import { Select, WhereCondition, QueryConditon } from './types';
import { FilterQuery } from 'mongoose';
import { test } from './test';

const parser = require('sqlite-parser');

let sql = `select c1, c2 from table1 where title = 'Land of the midnight sun'`;

/*
                 and
         and              =
      =       =       age   12
    id 1  name  'abc'  

{"$and":[{"id": 1},{"name": abc}, {"age": 12}]}
*/

let queryConditon: FilterQuery<QueryConditon> = { '$and': [], '$or': [] };

const parseWhereCondition = (whereConditon: WhereCondition, currentCondition = '') => {
  if (!whereConditon.left) {
    return;
  }

  parseWhereCondition(whereConditon.left, currentCondition);
 
  if (whereConditon?.operation && whereConditon?.operation !== '=') {
    console.log(whereConditon.operation);
    currentCondition = whereConditon.operation;
  }
  if (whereConditon?.operation === '=') {
    console.log(whereConditon.left.name, '=', whereConditon.right.value);
    if (currentCondition !== 'or') {
      queryConditon[`$and`]?.push({[`${whereConditon.left.name}`]: whereConditon.right.value});
    } else {
      queryConditon[`$or`]?.push({[`${whereConditon.left.name}`]: whereConditon.right.value});
    }
    currentCondition = '';
  }

  parseWhereCondition(whereConditon.right, currentCondition);
}

const select = (ast: Select) => {
  const {  where } = ast.statement[0];
  parseWhereCondition(where[0]);
}

select(parser(sql));

if (!queryConditon?.$and?.length) {
  delete queryConditon.$and;
}

if (!queryConditon?.$or?.length) {
  delete queryConditon.$or;
}

console.log(queryConditon);

test(queryConditon);
