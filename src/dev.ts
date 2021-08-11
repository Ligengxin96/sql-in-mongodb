import SQLParser from './index';

const sqlWhereConditon = `select * from t1 where id in(select id from t2)`;
const parser = new SQLParser();
const mongoQuery = parser.parseSql(sqlWhereConditon);
const selectedColumns = parser.getSelectedFeilds(sqlWhereConditon);


console.log(selectedColumns);
console.log(`db.test.find(${JSON.stringify(mongoQuery)})`);
console.log(mongoQuery);

// db.test.find({"$and":[{"a":{"$gt":"undefined"}},{"name":"123"}]})
// db.postmessages.find({ "$expr": { "$eq": [{ "$dateFromString": { "dateString": "2021-06-25T08:00:47.134Z" }}, "$createdTime" ]} })
// db.postmessages.find({ "$expr": { "$eq": [{ "$dateFromString": { "dateString": "2021-06-25T08:00:47.134Z" }}, "$createdTime" ]} })
