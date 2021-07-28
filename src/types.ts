export type WhereTypeAttribute = 'identifier' | 'literal' | 'expression'
export type Variant = 'column' | 'operation' | 'text' | 'decimal'

export type WhereCondition = {
  format: string,
  left: WhereCondition,
  operation: string,
  right: WhereCondition,
  type: String,
  variant: string,
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

export type Select = {
  statement: Array<SelectStatement>,
  type: String,
  variant: String,
}