/* eslint-disable import/no-extraneous-dependencies */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SQLParser from '../../index';
import PostModel from '../../models/post';

dotenv.config();

describe('Dev test base case', () => {
  beforeAll(() => {
    mongoose.connect(process.env.CONNECT_STRING as string, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(() => {
    mongoose.disconnect();
  });

  it('Test where statement', async () => {
    const sqlWhereConditon = `WHERE title = 'Land of the midnight sun'`;
    const parser = new SQLParser();
    const posts = await PostModel.find(parser.parseSql(sqlWhereConditon));
    expect(posts[0].title).toEqual('Land of the midnight sun');
  });

  it('Test where statement with and', async () => {
    const sqlWhereConditon = `WHERE title = 'Land of the midnight sun' and title = '123'`;
    const parser = new SQLParser();
    const posts = await PostModel.find(parser.parseSql(sqlWhereConditon));
    expect(posts.length).toEqual(0);
  });

  it('Test where statement with or', async () => {
    const sqlWhereConditon = `WHERE title = 'Land of the midnight sun' or title = 'Mangrove trees'`;
    const parser = new SQLParser();
    const posts = await PostModel.find(parser.parseSql(sqlWhereConditon));
    expect(posts.length).toEqual(2);
    expect(posts[0].title).toEqual('Land of the midnight sun');
    expect(posts[1].title).toEqual('Mangrove trees');
  });

  it('Test where statement with and && or', async () => {
    const sqlWhereConditon = `
      WHERE title = 'Land of the midnight sun' and title = 'Mangrove trees' 
      or message = 'copyright: Seljalandsfoss waterfall in the South Region of Iceland (© Tom Mackie/plainpicture)'`;
    const parser = new SQLParser();
    const posts = await PostModel.find(parser.parseSql(sqlWhereConditon));
    expect(posts[0].title).toEqual('Land of the midnight sun');
    expect(posts[0].message).toEqual('copyright: Seljalandsfoss waterfall in the South Region of Iceland (© Tom Mackie/plainpicture)');
  });

  it('Test where statement with or && and', async () => {
    const sqlWhereConditon = `
      WHERE title = 'Land of the midnight sun' or title = 'Mangrove trees' 
      and message = 'copyright: Seljalandsfoss waterfall in the South Region of Iceland (© Tom Mackie/plainpicture)'`;
    const parser = new SQLParser();
    const posts = await PostModel.find(parser.parseSql(sqlWhereConditon));
    expect(posts[0].title).toEqual('Land of the midnight sun');
    expect(posts[0].message).toEqual('copyright: Seljalandsfoss waterfall in the South Region of Iceland (© Tom Mackie/plainpicture)');
  });

  it('Test where statement with duplicate and & or', async () => {
    const sqlWhereConditon = `
      WHERE title = 'Land of the midnight sun' and title = 'Land of the midnight sun'
      or title = 'Mangrove trees' or title = 'Mangrove trees'`;
    const parser = new SQLParser();
    const posts = await PostModel.find(parser.parseSql(sqlWhereConditon));
    expect(posts.length).toEqual(2);
    expect(posts[0].title).toEqual('Land of the midnight sun');
    expect(posts[1].title).toEqual('Mangrove trees');
  });


  it('Test where statement with and && or, brackets', async () => {
    const sqlWhereConditon = `
      WHERE title = 'Land of the midnight sun' 
      and (message = 'copyright: Seljalandsfoss waterfall in the South Region of Iceland (© Tom Mackie/plainpicture)' 
      or title = 'Mangrove trees')`;
    const parser = new SQLParser();
    const posts = await PostModel.find(parser.parseSql(sqlWhereConditon));
    expect(posts[0].title).toEqual('Land of the midnight sun');
  });

  it('Test where statement with and,brackets && or', async () => {
    const sqlWhereConditon = `
      WHERE (title = 'Land of the midnight sun' 
      and message = 'copyright: Seljalandsfoss waterfall in the South Region of Iceland (© Tom Mackie/plainpicture)') 
      or title = 'Mangrove trees'`;
    const parser = new SQLParser();
    const posts = await PostModel.find(parser.parseSql(sqlWhereConditon));
    expect(posts.length).toEqual(2);
    expect(posts[0].title).toEqual('Land of the midnight sun');
    expect(posts[1].title).toEqual('Mangrove trees');
  });
});
