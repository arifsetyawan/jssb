import { JSONSchema } from './types';

const SCHEMA_PROPERTY_ORDER = [
  '$schema',
  'title',
  'description',
  'type',
  'const',
  'enum',
  'properties',
  'items',
  'required',
  'additionalProperties',
  'nullable',
  'minimum',
  'maximum',
  'minLength',
  'maxLength',
  'minItems',
  'maxItems',
  'uniqueItems',
  'pattern',
  'format',
  'default',
  'examples'
];

export function reorderSchemaProperties(schema: JSONSchema): JSONSchema {
  if (typeof schema !== 'object' || schema === null || Array.isArray(schema)) {
    return schema;
  }

  const ordered: JSONSchema = {};
  
  for (const key of SCHEMA_PROPERTY_ORDER) {
    if (key in schema) {
      const value = schema[key as keyof JSONSchema];
      
      if (key === 'properties' && value && typeof value === 'object') {
        const orderedProperties: Record<string, JSONSchema> = {};
        for (const [propKey, propValue] of Object.entries(value)) {
          orderedProperties[propKey] = reorderSchemaProperties(propValue as JSONSchema);
        }
        (ordered as any)[key] = orderedProperties;
      } else if (key === 'items' && value) {
        if (Array.isArray(value)) {
          (ordered as any)[key] = value.map(item => reorderSchemaProperties(item));
        } else {
          (ordered as any)[key] = reorderSchemaProperties(value as JSONSchema);
        }
      } else {
        (ordered as any)[key] = value;
      }
    }
  }
  
  for (const key of Object.keys(schema)) {
    if (!SCHEMA_PROPERTY_ORDER.includes(key)) {
      (ordered as any)[key] = schema[key as keyof JSONSchema];
    }
  }
  
  return ordered;
}