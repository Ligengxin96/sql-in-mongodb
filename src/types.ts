export type WhereTypeAttribute = 'identifier' | 'literal' | 'expression'
export type Variant = 'column' | 'operation' | 'text' | 'decimal'

export type WhereCondition = {
  format: string,
  left: WhereCondition,
  operation: string,
  right: WhereCondition,
  type: String,
  variant: Variant,
  name?: String,
  value?: string,
}

export type From = {
  name: string,
  type: WhereTypeAttribute,
  variant: Variant,
}

export type SelectStatement = {
  from: From,
  result: Array<From>,
  where: Array<WhereCondition>,
}

export type SQLAST = {
  statement: Array<SelectStatement>,
  type: String,
  variant: Variant,
}

export type QueryConditon = {
  $and?: Array<{ [key: string]: any }>,
  $or?: Array<{ [key: string]: any }>
}