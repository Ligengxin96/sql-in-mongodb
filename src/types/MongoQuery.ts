export type MongoQuery = {
  $and?: { [key: string]: unknown }[];
  $or?: { [key: string]: unknown }[];
};
