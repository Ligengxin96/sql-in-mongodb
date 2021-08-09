import SQLParser from './index';

const sqlWhereConditon = `WHERE name not like 'Leanne%'`;
const parser = new SQLParser();
const mongoQuery = parser.parseSql(sqlWhereConditon);


console.log(`db.test.find(${JSON.stringify(mongoQuery)})`);
console.log(mongoQuery);

// db.test.find({"$and":[{"a":{"$gt":"undefined"}},{"name":"123"}]})
// db.postmessages.find({ "$expr": { "$eq": [{ "$dateFromString": { "dateString": "2021-06-25T08:00:47.134Z" }}, "$createdTime" ]} })
// db.postmessages.find({ "$expr": { "$eq": [{ "$dateFromString": { "dateString": "2021-06-25T08:00:47.134Z" }}, "$createdTime" ]} })
// db.test.find({"name":{"$regex":"/^Leanne/i"}})
// src/dev.ts:8