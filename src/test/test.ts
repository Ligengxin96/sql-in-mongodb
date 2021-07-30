import mongoose, { FilterQuery } from 'mongoose';
import { parserSQLWhereConditon } from '../index';
import { QueryConditon } from '../types';
import PostModel from '../models/post';
import dotenv from 'dotenv';

dotenv.config();

export const test = async () => {
  try {
    await mongoose.connect(process.env.CONNECT_STRING as string,  { 
      useNewUrlParser: true, 
      useUnifiedTopology: true
    });

    const sqlWhereConditon = `WHERE title = 'Land of the midnight sun'`;

    const queryConditon: FilterQuery<QueryConditon> = parserSQLWhereConditon(sqlWhereConditon);

    const post = await PostModel.findOne(queryConditon);
    console.log(post.toString());
  } catch (error) {
    console.log(error);
  } 
}

test();

