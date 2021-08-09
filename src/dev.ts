import SQLParser from './index';

const sqlWhereConditon = `WHERE createdTime not between "2021-06-26" and "2021-06-27" and createdTime > "2021-06-24" and createdTime < "2021-06-28"`;
const parser = new SQLParser();
const mongoQuery = parser.parseSql(sqlWhereConditon);


console.log(`db.test.find(${JSON.stringify(mongoQuery)})`);
console.log(mongoQuery);

// db.test.find({"$and":[{"a":{"$gt":"undefined"}},{"name":"123"}]})
// db.postmessages.find({ "$expr": { "$eq": [{ "$dateFromString": { "dateString": "2021-06-25T08:00:47.134Z" }}, "$createdTime" ]} })
// db.postmessages.find({ "$expr": { "$eq": [{ "$dateFromString": { "dateString": "2021-06-25T08:00:47.134Z" }}, "$createdTime" ]} })
