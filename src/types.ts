export type WhereTypeAttribute = 'identifier' | 'literal' | 'expression';
export type Variant = 'column' | 'operation' | 'text' | 'decimal';

export type WhereCondition = {
  format: string;
  left: WhereCondition;
  operation: string;
  right: WhereCondition;
  type: WhereTypeAttribute;
  variant: Variant;
  name?: string;
  value?: string;
};

export type From = {
  name: string;
  type: WhereTypeAttribute;
  variant: Variant;
};

export type SelectStatement = {
  from: From;
  result: Array<From>;
  where: Array<WhereCondition>;
};

export type SQLAST = {
  statement: Array<SelectStatement>;
  type: string;
  variant: Variant;
};

export type QueryConditon = {
  $and?: Array<{ [key: string]: unknown }>;
  $or?: Array<{ [key: string]: unknown }>;
};
