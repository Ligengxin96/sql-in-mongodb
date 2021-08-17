import React, { useState, useEffect } from 'react'
import Editor from "@monaco-editor/react";

import { SQLParser } from 'sql-in-mongodb';

const parser = new SQLParser();

const  App = () => {
  const [sql, setSql] = useState('select * from t where (a = 1 and b = 2) or c = 3');
  const [json, setJson] = useState('');
  const [query, setMongoQuery] = useState('');
  const [error, setError] = useState(null);

  const onSourceChange = (sql) =>  {
    setSql(sql);
  }

  const convertSql = () => {
    let mongoQuery;
    try {
      mongoQuery = parser.parseSql(sql);
      setJson(JSON.stringify(mongoQuery, null, 2));
      setError(null);
    } catch (error) {
      setError('Invalid SQL');
      setJson(error.message);
      console.log(error);
    }
    try {
      const table = parser.getSelectedTable(sql);
      setMongoQuery(`db.${table}.find(${JSON.stringify(mongoQuery)})`);
      setError(null);
    } catch (error) {
      setError('Invalid SQL');
      setMongoQuery(error.message);
      console.log(error);
    }
  }

  useEffect(() => {
    convertSql();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{ backgroundColor: '#272822'}}>
      <div>
        <a title="SQL-in-MongoDB on GitHub" href="https://github.com/Ligengxin96/sql-in-mongodb" target="_blank" rel="noreferrer" style={{ textDecoration: 'none'}}>
          <h2 style={{ margin: '0 0 0rem 1rem', padding: '1rem 0 0 0' }}>
            <span style={{ color: '#e6db74' }}>SQL-in-MongoDB</span>
            <span style={{ color: '#ffffff'}}> Demo</span>
          </h2>
        </a>
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{ width: '48vw', marginLeft: "1rem" }}>
          <h4 style={{ backgroundColor: '#ec9652', marginBottom: '0' }}>
            <span style={{ color: '#aa5714', padding: '8px', fontSize: '1.1rem' }}>
              SQL Statement
            </span>
          </h4>
          <div style={{ borderColor: '#ec9652' }}>
            <Editor
              height="36vh"
              defaultLanguage="sql"
              theme={'vs-dark'}
              defaultValue={sql}
              value={sql}
              onChange={onSourceChange}
            />
          </div>
          <h4 style={{ backgroundColor: error ? '#fca4c3' : '#daf6a1', marginBottom: '0' }}>
            <span style={{ color: error ? '#CB0048' : '#557B0A', padding: '8px', fontSize: '1.1rem' }}>
              {error ? error : 'Mongo Query'}
            </span>
          </h4>
          <div>
            <Editor
              height="36vh"
              defaultLanguage="javascript"
              theme={'vs-dark'}
              value={query}
            />
          </div>
        </div>
        <div style={{ padding: '10rem 1rem' }}>
          <button onClick={convertSql} style={{ backgroundColor: '#08C988', boxShadow: '0 1px 2px 0', borderRadius: '4px', height: '3rem', width: '5rem' }}>
            convert
          </button>
        </div>
        <div style={{ width: '48vw', paddingRight: "1.5rem" }}>
          <div>
            <h4 style={{ backgroundColor: error ? '#fca4c3' : '#daf6a1', marginBottom: '0' }}>
              <span style={{ color: error ? '#CB0048' : '#557B0A', padding: '8px', fontSize: '1.1rem' }}>
                {error ? error : 'Mongo Query Condition'}
              </span>
            </h4>
            <Editor
              height="77vh"
              defaultLanguage="json"
              theme={'vs-dark'}
              value={json}
            />
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'center', alignItems: 'center', color: '#e6db74', paddingTop: '2rem', height: '9.7vh' }}>
        <a title="SQL-in-MongoDB on GitHub" href="https://github.com/Ligengxin96/sql-in-mongodb" target="_blank" rel="noreferrer" style={{ textDecoration: 'none'}}>
          <h4 style={{ margin: '0', color: '#e6db74' }}>SQL-in-MongoDB</h4>
        </a>
        <h4 style={{ margin: '0' }}>© {`${new Date().getFullYear()} Ligengxin96@gmail.com`}</h4>
      </div>  
    </div>
  )
}

export default App;
