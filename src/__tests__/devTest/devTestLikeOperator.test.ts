/* eslint-disable import/no-extraneous-dependencies */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SQLParser from '../../index';
import PostModel from '../../models/post';

dotenv.config();

describe('Dev test like operator', () => {
  beforeAll(() => {
    mongoose.connect(process.env.CONNECT_STRING as string, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(() => {
    mongoose.disconnect();
  });

  it('Test simple statement start with like operator', async () => {
    const sqlWhereConditon = `WHERE title like '%trees'`;
    const parser = new SQLParser();
    const posts = await PostModel.find(parser.parseSql(sqlWhereConditon));
    expect(String(posts[0].title).endsWith('trees'));
  });

  it('Test simple statement end with like operator', async () => {
    const sqlWhereConditon = `WHERE title like 'Mangrove%'`;
    const parser = new SQLParser();
    const posts = await PostModel.find(parser.parseSql(sqlWhereConditon));
    expect(String(posts[0].title).startsWith('Mangrove'));
  });

  it('Test simple statement start with like operator and should return []', async () => {
    const sqlWhereConditon = `WHERE title like '%Mangrove'`;
    const parser = new SQLParser();
    const posts = await PostModel.find(parser.parseSql(sqlWhereConditon));
    expect(posts.length).toEqual(0);
  });

  it('Test simple statement end with like operator in middle of the string', async () => {
    const sqlWhereConditon = `WHERE title like 'Mangrove%trees'`;
    const parser = new SQLParser();
    const posts = await PostModel.find(parser.parseSql(sqlWhereConditon));
    expect(String(posts[0].title).startsWith('Mangrove'));
    expect(String(posts[0].title).endsWith('trees'));
  });
});
