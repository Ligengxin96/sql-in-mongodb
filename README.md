# SQL-in-MongoDB

This tools can convert common sql query to mongodb query. Support node version >= 12

## How to use
```js
import SQLParser from 'sql-in-mongodb';
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

## SQLParser() Option parameters
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

