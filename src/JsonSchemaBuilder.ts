import { JSONSchema, JSONValue, JSONObject, JSONArray, SchemaBuilderOptions } from './types';
import { reorderSchemaProperties } from './utils';

export class JsonSchemaBuilder {
  private options: Required<SchemaBuilderOptions>;
  private enumMap: Map<string, Map<any, number>> = new Map();

  constructor(options: SchemaBuilderOptions = {}) {
    this.options = {
      includeExamples: options.includeExamples ?? true,
      detectFormat: options.detectFormat ?? true,
      requiredByDefault: options.requiredByDefault ?? true,
      additionalProperties: options.additionalProperties ?? false,
      inferEnums: options.inferEnums ?? false,
      enumThreshold: options.enumThreshold ?? 5,
    };
  }

  build(sample: JSONValue, title?: string): JSONSchema {
    this.enumMap.clear();
    if (this.options.inferEnums && Array.isArray(sample)) {
      this.collectEnumCandidates(sample);
    }
    
    const schema = this.buildSchema(sample);
    
    if (title) {
      schema.title = title;
    }
    
    schema.$schema = 'http://json-schema.org/draft-07/schema#';
    
    return reorderSchemaProperties(schema);
  }

  private buildSchema(value: JSONValue, path: string = ''): JSONSchema {
    if (value === null) {
      return { type: 'null' };
    }
    
    if (value === undefined) {
      return {};
    }

    const type = this.getType(value);
    const schema: JSONSchema = { type };

    if (this.options.includeExamples && value !== null) {
      schema.examples = [value];
    }

    switch (type) {
      case 'string':
        this.enrichStringSchema(schema, value as string);
        break;
      
      case 'number':
      case 'integer':
        this.enrichNumberSchema(schema, value as number);
        break;
      
      case 'boolean':
        break;
      
      case 'array':
        this.enrichArraySchema(schema, value as JSONArray, path);
        break;
      
      case 'object':
        this.enrichObjectSchema(schema, value as JSONObject, path);
        break;
    }

    if (this.options.inferEnums && path) {
      const enumValues = this.enumMap.get(path);
      if (enumValues && enumValues.size <= this.options.enumThreshold) {
        schema.enum = Array.from(enumValues.keys());
        delete schema.examples;
      }
    }

    return schema;
  }

  private getType(value: JSONValue): string {
    if (value === null) return 'null';
    if (value === undefined) return 'null';
    if (Array.isArray(value)) return 'array';
    
    const type = typeof value;
    if (type === 'number') {
      return Number.isInteger(value) ? 'integer' : 'number';
    }
    
    return type;
  }

  private enrichStringSchema(schema: JSONSchema, value: string): void {
    schema.minLength = 0;
    schema.maxLength = Math.max(value.length * 2, 100);

    if (this.options.detectFormat) {
      const format = this.detectStringFormat(value);
      if (format) {
        schema.format = format;
      }
    }
  }

  private detectStringFormat(value: string): string | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(value)) return 'email';

    const urlRegex = /^https?:\/\/.+/;
    if (urlRegex.test(value)) return 'uri';

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (dateRegex.test(value)) return 'date';

    const dateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})?$/;
    if (dateTimeRegex.test(value)) return 'date-time';

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(value)) return 'uuid';

    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipv4Regex.test(value)) {
      const parts = value.split('.').map(Number);
      if (parts.every(p => p >= 0 && p <= 255)) return 'ipv4';
    }

    const ipv6Regex = /^([0-9a-fA-F]{0,4}:){7}[0-9a-fA-F]{0,4}$/;
    if (ipv6Regex.test(value)) return 'ipv6';

    return null;
  }

  private enrichNumberSchema(schema: JSONSchema, value: number): void {
    schema.minimum = value - Math.abs(value * 0.5);
    schema.maximum = value + Math.abs(value * 0.5);
  }

  private enrichArraySchema(schema: JSONSchema, array: JSONArray, path: string): void {
    schema.minItems = 0;
    schema.maxItems = Math.max(array.length * 2, 100);

    if (array.length === 0) {
      schema.items = {};
      return;
    }

    const itemTypes = new Set<string>();
    const itemSchemas: JSONSchema[] = [];

    for (let i = 0; i < array.length; i++) {
      const itemType = this.getType(array[i]);
      if (!itemTypes.has(itemType)) {
        itemTypes.add(itemType);
        const itemPath = `${path}[${i}]`;
        itemSchemas.push(this.buildSchema(array[i], itemPath));
      }
    }

    if (itemSchemas.length === 1) {
      schema.items = itemSchemas[0];
    } else {
      schema.items = this.mergeSchemas(itemSchemas);
    }

    const allSameType = itemTypes.size === 1;
    if (allSameType && itemTypes.has('string')) {
      const uniqueValues = new Set(array);
      if (uniqueValues.size === array.length) {
        schema.uniqueItems = true;
      }
    }
  }

  private enrichObjectSchema(schema: JSONSchema, obj: JSONObject, path: string): void {
    schema.properties = {};
    
    if (this.options.requiredByDefault) {
      schema.required = [];
    }

    for (const [key, value] of Object.entries(obj)) {
      const propPath = path ? `${path}.${key}` : key;
      schema.properties[key] = this.buildSchema(value, propPath);
      
      if (this.options.requiredByDefault && schema.required) {
        schema.required.push(key);
      }
    }

    schema.additionalProperties = this.options.additionalProperties;
  }

  private mergeSchemas(schemas: JSONSchema[]): JSONSchema {
    if (schemas.length === 0) return {};
    if (schemas.length === 1) return schemas[0];

    const types = new Set<string>();
    const merged: JSONSchema = {};

    for (const schema of schemas) {
      if (schema.type) {
        if (Array.isArray(schema.type)) {
          schema.type.forEach(t => types.add(t));
        } else {
          types.add(schema.type);
        }
      }
    }

    if (types.size === 1) {
      merged.type = Array.from(types)[0];
    } else if (types.size > 1) {
      merged.type = Array.from(types);
    }

    const objectSchemas = schemas.filter(s => s.type === 'object');
    if (objectSchemas.length > 0) {
      merged.properties = {};
      const allKeys = new Set<string>();
      
      for (const schema of objectSchemas) {
        if (schema.properties) {
          Object.keys(schema.properties).forEach(key => allKeys.add(key));
        }
      }

      for (const key of allKeys) {
        const propSchemas = objectSchemas
          .filter(s => s.properties && s.properties[key])
          .map(s => s.properties![key]);
        
        if (propSchemas.length > 0) {
          merged.properties[key] = propSchemas.length === 1 
            ? propSchemas[0] 
            : this.mergeSchemas(propSchemas);
        }
      }

      if (this.options.additionalProperties !== undefined) {
        merged.additionalProperties = this.options.additionalProperties;
      }
    }

    const arraySchemas = schemas.filter(s => s.type === 'array');
    if (arraySchemas.length > 0 && arraySchemas[0].items) {
      merged.items = arraySchemas[0].items;
    }

    return merged;
  }

  private collectEnumCandidates(array: JSONArray, parentPath: string = ''): void {
    for (let i = 0; i < array.length; i++) {
      const item = array[i];
      
      if (typeof item === 'object' && item !== null) {
        if (Array.isArray(item)) {
          this.collectEnumCandidates(item, `${parentPath}[${i}]`);
        } else {
          for (const [key, value] of Object.entries(item)) {
            const path = `${parentPath}.${key}`;
            
            if (Array.isArray(value)) {
              this.collectEnumCandidates(value, path);
            } else if (typeof value !== 'object' || value === null) {
              if (!this.enumMap.has(path)) {
                this.enumMap.set(path, new Map());
              }
              const valueMap = this.enumMap.get(path)!;
              valueMap.set(value, (valueMap.get(value) || 0) + 1);
            }
          }
        }
      }
    }
  }

  buildFromMultipleSamples(samples: JSONValue[], title?: string): JSONSchema {
    if (samples.length === 0) {
      throw new Error('At least one sample is required');
    }

    if (samples.length === 1) {
      return this.build(samples[0], title);
    }

    const schemas = samples.map(sample => this.build(sample));
    const merged = this.mergeSchemas(schemas);
    
    if (title) {
      merged.title = title;
    }
    
    merged.$schema = 'http://json-schema.org/draft-07/schema#';
    
    if (this.options.includeExamples) {
      merged.examples = samples;
    }

    return reorderSchemaProperties(merged);
  }
}