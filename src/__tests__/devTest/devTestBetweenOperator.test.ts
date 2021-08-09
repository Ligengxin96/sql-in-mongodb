/* eslint-disable import/no-extraneous-dependencies */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SQLParser from '../../index';
import PostModel from '../../models/post';

dotenv.config();

describe('Dev test between operator', () => {
  beforeAll(() => {
    mongoose.connect(process.env.CONNECT_STRING as string, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(() => {
    mongoose.disconnect();
  });

  it('Test statement start with between and operator', async () => {
    const parser = new SQLParser();
    let posts = await PostModel.find(parser.parseSql(`WHERE createdTime between "2021-08-05" and "2021-08-06"`));
    expect(posts.length > 1);
    expect(posts.every((post: any) => {  post.createdTime >= new Date("2021-08-05") && post.createdTime <= new Date("2021-08-06") }));

    posts = await PostModel.find(parser.parseSql(`WHERE createdTime not between "2021-06-26" and "2021-06-27" and createdTime > "2021-06-24" and createdTime < "2021-06-28"`));
    expect(posts.length > 1);
    expect(posts.every((post: any) => {  post.createdTime > new Date("2021-06-24") && post.createdTime < new Date("2021-06-28") }));
  });

});
