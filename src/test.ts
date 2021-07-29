import mongoose, { FilterQuery } from 'mongoose';
import { QueryConditon } from './types';
import PostModel from './models/post';
import dotenv from 'dotenv';

dotenv.config();

export const test = async (queryConditon: FilterQuery<QueryConditon>) => {
  try {
    await mongoose.connect(process.env.CONNECT_STRING as string,  { 
      useNewUrlParser: true, 
      useUnifiedTopology: true
    });
    const post = await PostModel.findOne(queryConditon);
    console.log(post.toString());
  } catch (error) {
    console.log(error);
  } 
}

