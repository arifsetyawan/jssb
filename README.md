# JSON Schema Builder

A TypeScript library and CLI tool to generate JSON schemas from sample JSON data. Supports complex nested objects, arrays, and automatic format detection.

## 🛟 Support me to keep crafting 
[![BuyMeACoffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/arifsetyawan) 

<!-- Proudly created with GPRM ( https://gprm.itsvg.in ) -->

## Installation

### Global Installation (CLI)
```bash
npm install -g jssb-cli
```

### Local Installation (Library)
```bash
npm install jssb-cli
```

## CLI Usage

After global installation, use the `jssb` command:

```bash
# Basic usage - generates input-name.schema.json
jssb data.json

# Specify custom output file
jssb data.json --output my-schema.json

# With custom title and options
jssb data.json --title "User Schema" --no-examples --infer-enums
```

### CLI Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--output` | `-o` | Output file path | `<input-name>.schema.json` |
| `--title` | `-t` | Schema title | Derived from filename |
| `--no-examples` | | Exclude examples from schema | Include examples |
| `--no-format` | | Disable format detection | Format detection enabled |
| `--no-required` | | Don't mark properties as required | Mark as required |
| `--additional-props` | | Allow additional properties | Disallow additional properties |
| `--infer-enums` | | Enable enum inference | Disabled |
| `--enum-threshold` | | Max unique values for enums | 5 |
| `--help` | `-h` | Show help message | |

### CLI Examples

```bash
# Generate schema for user data
jssb user.json

# Custom output location
jssb data/users.json --output schemas/user.schema.json

# With enum detection for repeated values
jssb config.json --infer-enums --enum-threshold 3

# Minimal schema without examples
jssb api-response.json --no-examples --title "API Response"
```

## Library Usage

```typescript
import { JsonSchemaBuilder } from 'jsonschema-builder';

const builder = new JsonSchemaBuilder({
  includeExamples: true,
  detectFormat: true,
  requiredByDefault: true,
  additionalProperties: false
});

const sampleData = {
  name: 'John Doe',
  age: 30,
  email: 'john@example.com',
  hobbies: ['reading', 'coding']
};

const schema = builder.build(sampleData, 'User');
console.log(JSON.stringify(schema, null, 2));
```

## Features

- ✅ **Complex nested objects** - Handles deep nesting and complex structures
- ✅ **Array support** - Mixed types, nested arrays, unique item detection
- ✅ **Format detection** - Email, URL, date, UUID, IP addresses
- ✅ **Multiple samples** - Build schemas from multiple JSON samples
- ✅ **Enum inference** - Detect repeated values and create enums
- ✅ **Type validation** - Strict TypeScript types
- ✅ **CLI tool** - Easy command-line usage
- ✅ **Configurable** - Many options to customize output

### Supported Formats

- **email** - `user@example.com`
- **uri** - `https://example.com`
- **date** - `2024-01-15`
- **date-time** - `2024-01-15T10:30:00.000Z`
- **uuid** - `550e8400-e29b-41d4-a716-446655440000`
- **ipv4** - `192.168.1.1`
- **ipv6** - `2001:0db8:85a3:0000:0000:8a2e:0370:7334`

## Configuration Options

```typescript
interface SchemaBuilderOptions {
  includeExamples?: boolean;     // Include sample values (default: true)
  detectFormat?: boolean;        // Auto-detect string formats (default: true)
  requiredByDefault?: boolean;   // Mark properties as required (default: true)
  additionalProperties?: boolean; // Allow additional properties (default: false)
  inferEnums?: boolean;          // Detect enum patterns (default: false)
  enumThreshold?: number;        // Max unique values for enums (default: 5)
}
```

## Examples

### Input JSON
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user": {
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "tags": ["premium", "verified"]
}
```

### Generated Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "title": "User",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid"
    },
    "user": {
      "type": "object",
      "properties": {
        "name": { "type": "string" },
        "email": { "type": "string", "format": "email" },
        "createdAt": { "type": "string", "format": "date-time" }
      },
      "required": ["name", "email", "createdAt"],
      "additionalProperties": false
    },
    "tags": {
      "type": "array",
      "items": { "type": "string" },
      "uniqueItems": true
    }
  },
  "required": ["id", "user", "tags"],
  "additionalProperties": false
}
```

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run examples
npm run example

# Link for local testing
npm link
```

## License

MIT
