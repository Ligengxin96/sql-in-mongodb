/* eslint-disable import/no-extraneous-dependencies */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { parseSQLWhereConditon } from '../../index';
import PostModel from '../../models/post';

dotenv.config();

describe.skip('Dev Test', () => {
  beforeAll(() => {
    mongoose.connect(process.env.CONNECT_STRING as string, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(() => {
    mongoose.disconnect();
  });

  it('Test simple select statement', async () => {
    const sqlWhereConditon = `WHERE title = 'Land of the midnight sun'`;
    const queryConditon = parseSQLWhereConditon(sqlWhereConditon);
    const posts = await PostModel.find(queryConditon);
    expect(posts[0].title).toEqual('Land of the midnight sun');
  });

  it('Test simple select statement with and', async () => {
    const sqlWhereConditon = `WHERE title = 'Land of the midnight sun' and title = '123'`;
    const queryConditon = parseSQLWhereConditon(sqlWhereConditon);
    const posts = await PostModel.find(queryConditon);
    expect(posts.length).toEqual(0);
  });

  it('Test simple select statement with or', async () => {
    const sqlWhereConditon = `WHERE title = 'Land of the midnight sun' or title = 'Mangrove trees'`;
    const queryConditon = parseSQLWhereConditon(sqlWhereConditon);
    const posts = await PostModel.find(queryConditon);
    expect(posts.length).toEqual(2);
  });

  it('Test simple select statement with and & or', async () => {
    const sqlWhereConditon = `
      WHERE title = 'Land of the midnight sun' or title = 'Mangrove trees' 
      and message = 'copyright: Seljalandsfoss waterfall in the South Region of Iceland (© Tom Mackie/plainpicture)'`;
    const queryConditon = parseSQLWhereConditon(sqlWhereConditon);
    const posts = await PostModel.find(queryConditon);
    expect(posts[0].title).toEqual('Land of the midnight sun');
  });

  it('Test simple select statement with duplicate and & or conditon', async () => {
    const sqlWhereConditon = `
      WHERE title = 'Land of the midnight sun' and title = 'Land of the midnight sun'
      or title = 'Mangrove trees' or title = 'Mangrove trees'`;
    const queryConditon = parseSQLWhereConditon(sqlWhereConditon);
    const posts = await PostModel.find(queryConditon);
    expect(posts.length).toEqual(2);
  });
});
