export type MongoQuery = {
  $and?: Array<{ [key: string]: unknown }>;
  $or?: Array<{ [key: string]: unknown }>;
};
