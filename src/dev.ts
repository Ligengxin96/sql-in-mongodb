import { SQLParser } from './index';

const sqlWhereConditon = `select t1.*, t2.* from t1, t2`;
const parser = new SQLParser({multipleLineSql: true});
const mongoQuery = parser.parseSql(sqlWhereConditon);
const selectedColumns = parser.getSelectedFeilds(sqlWhereConditon);
const tableNmae = parser.getSelectedTable(sqlWhereConditon);

console.log(selectedColumns);
console.log(`db.test.find(${JSON.stringify(mongoQuery)})`);
console.log(tableNmae);

// db.test.find({$and:[{"a":{$gt:"undefined"}},{"name":"123"}]})
// db.postmessages.find({ $expr: { "$eq": [{ "$dateFromString": { "dateString": "2021-06-25T08:00:47.134Z" }}, "$createdTime" ]} })
// db.postmessages.find({ $expr: { "$eq": [{ "$dateFromString": { "dateString": "2021-06-25T08:00:47.134Z" }}, "$createdTime" ]} })
