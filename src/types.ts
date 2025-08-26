export interface JSONSchema {
  type?: string | string[];
  properties?: Record<string, JSONSchema>;
  items?: JSONSchema | JSONSchema[];
  required?: string[];
  additionalProperties?: boolean | JSONSchema;
  description?: string;
  examples?: any[];
  enum?: any[];
  const?: any;
  nullable?: boolean;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  $schema?: string;
  title?: string;
  default?: any;
}

export type JSONValue = 
  | string 
  | number 
  | boolean 
  | null 
  | undefined
  | JSONObject 
  | JSONArray;

export interface JSONObject {
  [key: string]: JSONValue;
}

export interface JSONArray extends Array<JSONValue> {}

export interface SchemaBuilderOptions {
  includeExamples?: boolean;
  detectFormat?: boolean;
  requiredByDefault?: boolean;
  additionalProperties?: boolean;
  inferEnums?: boolean;
  enumThreshold?: number;
}