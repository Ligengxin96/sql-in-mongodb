import SQLParser from './index';

const sqlWhereConditon = `WHERE title = false`;
const parser = new SQLParser();
const mongoQuery = parser.parseSql(sqlWhereConditon);


console.log(`db.postmessages.find(${JSON.stringify(mongoQuery)})`);
console.log(mongoQuery);
