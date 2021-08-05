// eslint-disable-next-line import/no-extraneous-dependencies
import { FilterQuery } from 'mongoose';
import BinaryTree from './BinaryTree';

import { SQLAST, WhereCondition, QueryConditon } from './types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const parser = require('sqlite-parser');

const SQLPREFIX = 'SELECT * FROM SOMETABLE';

const CONDITION_OPERATORS = ['and', 'or'];

// const OPERATOR = ['and', 'or', 'like', 'not like', 'in', 'not in', 'between', 'not between', 'is', 'is not', '>', '<', '>=', '<=', '!='];

const buildTree = function (preorder: string[], inorder: string[]): BinaryTree | null {
  if (preorder.length === 0){
      return null;
  }
      
  const rootNodeValue = preorder[0];
  const tree = new BinaryTree(rootNodeValue);
  const inorderRootIndex = inorder.indexOf(rootNodeValue);

  const preorderLeftTree = preorder.slice(1, inorderRootIndex + 1);
  const inorderLeftTree = inorder.slice(0, inorderRootIndex);
  tree.left = buildTree(preorderLeftTree, inorderLeftTree);

  const preorderRightTree = preorder.slice(inorderRootIndex + 1);
  const inorderRightTree = inorder.slice(inorderRootIndex + 1);
  tree.right = buildTree(preorderRightTree, inorderRightTree);

  return tree;
};

const getWhereConditionInorder = (whereConditon: WhereCondition, conditionStack: string[]) => {
  if (whereConditon == null) {
    return;
  }

  const operator = whereConditon.operation?.toLowerCase();

  if (whereConditon.left) {
    getWhereConditionInorder(whereConditon.left, conditionStack);
  }

  if (operator != null) {
    if (CONDITION_OPERATORS.indexOf(operator) === -1) {
      conditionStack.push(`${whereConditon.left.name} ${operator} ${whereConditon.right.value}`);
    } else {
      conditionStack.push(operator);
    }
  }

  if (whereConditon.right) {
    getWhereConditionInorder(whereConditon.right, conditionStack);
  }
};

const getWhereConditionPreorder = (whereConditon: WhereCondition, conditionStack: string[]) => {
  if (whereConditon == null) {
    return;
  }

  const operator = whereConditon.operation?.toLowerCase();

  if (operator != null) {
    if (CONDITION_OPERATORS.indexOf(operator) === -1) {
      conditionStack.push(`${whereConditon.left.name} ${operator} ${whereConditon.right.value}`);
    } else {
      conditionStack.push(operator);
    }
  }

  if (whereConditon.left) {
    getWhereConditionPreorder(whereConditon.left, conditionStack);
  }

  if (whereConditon.right) {
    getWhereConditionPreorder(whereConditon.right, conditionStack);
  }
};

const generateMongoQuery = (conditionTree: BinaryTree) => {
  const { val, left, right } = conditionTree;
  if (val && !left && !right) {
    let [key, value] = val.split('=');
    key = key.trim();
    value = value.trim();
    return { [key]: value };
  }
  if (right && left) {
    if (CONDITION_OPERATORS.indexOf(val) > -1) {
      return { [`$${val}`]: [ generateMongoQuery(left), generateMongoQuery(right) ]}
    }
  } 
  if (right) {
    return generateMongoQuery(right);
  }
  if (left) {
    return generateMongoQuery(left);
  }
}
/*{$or: [ { $and: [{ "title": 'Land of the midnight sun' }, 
{ "message": 'copyright: Seljalandsfoss waterfall in the South Region of Iceland (© Tom Mackie/plainpicture)' }] }, 
{ "title": 'Mangrove trees' } ]}
*/
const processSqlAst = (ast: SQLAST): FilterQuery<QueryConditon> => {
  const { where } = ast.statement[0];
  const conditionInorderStack: string[] = [];
  const conditionPreorderStack: string[] = [];
  getWhereConditionInorder(where[0], conditionInorderStack);
  getWhereConditionPreorder(where[0], conditionPreorderStack);
  const conditionTree = buildTree(conditionPreorderStack, conditionInorderStack);
  if (conditionTree) {
   const result = generateMongoQuery(conditionTree);
   console.log(JSON.stringify(result));
   return result;
  }
  return {};
};

export const parseSQLWhereConditon = (sqlWhereConditon: string): FilterQuery<QueryConditon> => {
  sqlWhereConditon = sqlWhereConditon.trim();
  if (sqlWhereConditon.match(/^where\s.*/i)) {
    let sqlAst: SQLAST;
    try {
      sqlAst = parser(`${SQLPREFIX} ${sqlWhereConditon}`);
    } catch (error) {
      console.log(error.message);
      throw new Error('Invalid SQL where condition, Please check your SQL where condition statement.');
    }
    return processSqlAst(sqlAst);
  } else {
    throw new Error('Invalid SQL where condition, Please check your SQL where condition statement.');
  }
};

const sqlWhereConditon = `WHERE (title = 'Land of the midnight sun' 
and message = 'copyright: Seljalandsfoss waterfall in the South Region of Iceland (© Tom Mackie/plainpicture)') 
or title = 'Mangrove trees'`;
// const sqlWhereConditon = `WHERE title = 'Mangrove trees'`;
parseSQLWhereConditon(sqlWhereConditon);