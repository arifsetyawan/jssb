import { JsonSchemaBuilder } from '../src';

const builder = new JsonSchemaBuilder({
  includeExamples: true,
  detectFormat: true,
  requiredByDefault: true,
  additionalProperties: false
});

console.log('=== Example 1: Simple Object ===');
const simpleData = {
  name: 'John Doe',
  age: 30,
  email: 'john.doe@example.com',
  isActive: true
};

const simpleSchema = builder.build(simpleData, 'User');
console.log(JSON.stringify(simpleSchema, null, 2));

console.log('\n=== Example 2: Complex Nested Object ===');
const complexData = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  user: {
    firstName: 'Jane',
    lastName: 'Smith',
    contact: {
      email: 'jane.smith@example.com',
      phone: '+1-555-0100',
      addresses: [
        {
          type: 'home',
          street: '123 Main St',
          city: 'New York',
          zipCode: '10001',
          country: 'USA',
          coordinates: {
            lat: 40.7128,
            lng: -74.0060
          }
        },
        {
          type: 'work',
          street: '456 Business Ave',
          city: 'San Francisco',
          zipCode: '94105',
          country: 'USA',
          coordinates: {
            lat: 37.7749,
            lng: -122.4194
          }
        }
      ]
    },
    preferences: {
      newsletter: true,
      notifications: {
        email: true,
        sms: false,
        push: true
      },
      theme: 'dark'
    }
  },
  metadata: {
    createdAt: '2024-01-15T10:30:00.000Z',
    updatedAt: '2024-01-16T14:45:00.000Z',
    version: 2,
    tags: ['premium', 'verified', 'active']
  },
  stats: {
    loginCount: 42,
    lastLogin: '2024-01-16T09:00:00.000Z',
    purchases: [
      {
        orderId: 'ORD-001',
        amount: 99.99,
        currency: 'USD',
        date: '2024-01-10',
        items: [
          {
            sku: 'PROD-123',
            name: 'Premium Subscription',
            quantity: 1,
            price: 99.99
          }
        ]
      },
      {
        orderId: 'ORD-002',
        amount: 49.99,
        currency: 'USD',
        date: '2024-01-12',
        items: [
          {
            sku: 'PROD-456',
            name: 'Add-on Service',
            quantity: 2,
            price: 24.995
          }
        ]
      }
    ]
  }
};

const complexSchema = builder.build(complexData, 'UserProfile');
console.log(JSON.stringify(complexSchema, null, 2));

console.log('\n=== Example 3: Array of Mixed Types ===');
const mixedArray = [
  'string value',
  42,
  true,
  null,
  { key: 'value' },
  [1, 2, 3]
];

const mixedSchema = builder.build(mixedArray, 'MixedArray');
console.log(JSON.stringify(mixedSchema, null, 2));

console.log('\n=== Example 4: Building from Multiple Samples ===');
const samples = [
  {
    id: 1,
    name: 'Product A',
    price: 19.99,
    inStock: true,
    categories: ['electronics']
  },
  {
    id: 2,
    name: 'Product B',
    price: 29.99,
    inStock: false,
    categories: ['electronics', 'gaming'],
    discount: 0.1
  },
  {
    id: 3,
    name: 'Product C',
    price: 39.99,
    inStock: true,
    categories: ['accessories'],
    rating: 4.5
  }
];

const mergedSchema = builder.buildFromMultipleSamples(samples, 'Product');
console.log(JSON.stringify(mergedSchema, null, 2));

console.log('\n=== Example 5: With Enum Inference ===');
const enumBuilder = new JsonSchemaBuilder({
  inferEnums: true,
  enumThreshold: 3
});

const dataWithEnums = [
  { status: 'active', role: 'admin', level: 1 },
  { status: 'inactive', role: 'user', level: 2 },
  { status: 'active', role: 'admin', level: 1 },
  { status: 'pending', role: 'user', level: 3 },
  { status: 'active', role: 'moderator', level: 2 }
];

const enumSchema = enumBuilder.build(dataWithEnums, 'UserStatus');
console.log(JSON.stringify(enumSchema, null, 2));

console.log('\n=== Example 6: Format Detection ===');
const dataWithFormats = {
  email: 'user@example.com',
  website: 'https://example.com',
  birthDate: '1990-01-15',
  lastLogin: '2024-01-16T10:30:00.000Z',
  uuid: '550e8400-e29b-41d4-a716-446655440000',
  ipAddress: '192.168.1.1',
  ipv6Address: '2001:0db8:85a3:0000:0000:8a2e:0370:7334'
};

const formatSchema = builder.build(dataWithFormats, 'FormattedData');
console.log(JSON.stringify(formatSchema, null, 2));