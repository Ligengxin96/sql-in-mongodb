import mongoose from 'mongoose';

const testSchema = new mongoose.Schema({
    id: Number,
    name: String,
    username: String,
    email: String,
    address: {
      street: String,
      suite: String,
      city: String,
      zipcode: String,
      geo: {
        lat: Number,
        lng: Number
      }
    },
    phone: String,
    website: String,
    company: {
      name: String,
      catchPhrase: String,
      bs: String,
    },
    createTime: {
      type: Date,
      default: new Date(),
    }
});

const TestModel = mongoose.model('test', testSchema, 'test');

export default TestModel;