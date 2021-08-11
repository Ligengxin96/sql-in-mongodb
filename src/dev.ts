import SQLParser from './index';

const sqlWhereConditon = `
select * from t WHERE title >= 123 or title <= 234 
or title in ('1', '2') or id between 1 and 2
or title = '123' or title is not null
`;
const parser = new SQLParser({multipleLineSql: true});
const mongoQuery = parser.parseSql(sqlWhereConditon);
const selectedColumns = parser.getSelectedFeilds(sqlWhereConditon);


console.log(selectedColumns);
console.log(`db.test.find(${JSON.stringify(mongoQuery)})`);
console.log(mongoQuery);

// db.test.find({$and:[{"a":{$gt:"undefined"}},{"name":"123"}]})
// db.postmessages.find({ $expr: { "$eq": [{ "$dateFromString": { "dateString": "2021-06-25T08:00:47.134Z" }}, "$createdTime" ]} })
// db.postmessages.find({ $expr: { "$eq": [{ "$dateFromString": { "dateString": "2021-06-25T08:00:47.134Z" }}, "$createdTime" ]} })
