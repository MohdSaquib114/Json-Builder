export interface SchemaField {
  id: string;
  key: string;
  type: 'String' | 'Number' | 'Nested';
  defaultValue?: string | number;
  fields?: SchemaField[];
}

export interface SchemaData {
  fields: SchemaField[];
}


export type JsonSchemaValue = string | number | JsonSchema;


export interface JsonSchema {
  [key: string]: JsonSchemaValue;
}