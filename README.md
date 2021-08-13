# SQL-in-MongoDB

[![Build Status](https://travis-ci.com/Ligengxin96/sql-in-mongodb.svg?branch=main)](https://travis-ci.com/Ligengxin96/sql-in-mongodb)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/d923c9f2853f44f295c383d9943b56cc)](https://www.codacy.com/manual/Ligengxin96/SQL-in-MongoDB?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Ligengxin96/SQL-in-MongoDB&amp;utm_campaign=Badge_Grade)
[![Coverage Status](https://coveralls.io/repos/github/Ligengxin96/sql-in-mongodb/badge.svg?branch=main)](https://coveralls.io/github/Ligengxin96/sql-in-mongodb?branch=main)
[![license](https://img.shields.io/badge/license-GPLv3-brightgreen.svg)](https://github.com/Ligengxin96/sql-in-mongodb/blob/main/LICENSE)

This tools can convert common sql query to mongodb query. Support node version >= 12

## :star: Why we need this tool

If we have a complex query condition, use mongodb query we should write complex json object, and sometime we often missing the brackets, but use this tools, we just need write a simple sql query and convert it to mongodb query by this tool.

## :rocket: How to use

### 1. install dependency
```bash
npm install sql-in-mongodb
```
or

```bash
yarn add sql-in-mongodb
```

### 2. Code example
```js
import SQLParser from 'sql-in-mongodb'; // for commonjs:  const SQLParser = require('sql-in-mongodb');
// database data: {a: 1, b: 2}
const sqlQuery = `where a = 1`; // you also can use: `select * from tablename where a = 1`
const parser = new SQLParser();
const data = await TestModel.find(parser.parseSql(sqlQuery));
console.log(JSON.stringify(data)); // output [{a: 1, b: 2}]
```

If you want select some fields

```js
import SQLParser from 'sql-in-mongodb';
// database data: {a: 1, b: 2, c: 3, d: 4}
const sqlQuery = `select a,b from test where a = 1`;
const parser = new SQLParser();
const mongoQuery = parser.parseSql(sqlQuery);
const selectedFileds = parser.getSelectedFeilds(sqlQuery);
const data = await TestModel.findOne(mongoQuery, selectedFileds);
console.log(JSON.stringify(data)); // output {a: 1, b: 2}
```

## :question: SQLParser() Option parameters
```ts
export type Option = {
  likeOpsCaseSensitive?: boolean, // if true, the like operator will be case sensitive
  multipleLineSql?: boolean, // if true, the sql will be splited by `;` and parsed mongodb query will be an array
  database?: Database, // Todo: support each database advanced query statement. only suppport common sql query now
}

// the default value
const DEFAULT_OPTIONS: Option = {
  likeOpsCaseSensitive: false,
  multipleLineSql: false,
  database: 'mysql', 
}
```

## :eyes: Todo
1. Support cli 
2. Support each database advanced query statement, only suppport common sql query now
