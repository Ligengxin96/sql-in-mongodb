import SQLParser from './index';

const sqlWhereConditon = `WHERE title like 'a\\%'`;
const parser = new SQLParser();
const mongoQuery = parser.parseSql(sqlWhereConditon);


console.log(`db.test.find(${JSON.stringify(mongoQuery)})`);
console.log(mongoQuery);
