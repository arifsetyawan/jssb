#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { JsonSchemaBuilder } = require('../dist/index');

function showHelp() {
  console.log(`
JSON Schema Builder CLI

Usage: jssb <input.json> [options]

Arguments:
  input.json          Path to the input JSON file

Options:
  --output, -o        Output file path (default: <input-name>.schema.json)
  --title, -t         Schema title (default: derived from filename)
  --no-examples       Exclude examples from schema
  --no-format         Disable format detection
  --no-required       Don't mark properties as required by default
  --additional-props  Allow additional properties in objects
  --infer-enums       Enable enum inference for repeated values
  --enum-threshold    Max unique values for enum inference (default: 5)
  --help, -h          Show this help message

Examples:
  jssb data.json
  jssb data.json --output schema.json
  jssb data.json --title "My Schema" --no-examples
  jssb data.json --infer-enums --enum-threshold 3
`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }

  const inputFile = args[0];
  const options = {
    includeExamples: true,
    detectFormat: true,
    requiredByDefault: true,
    additionalProperties: false,
    inferEnums: false,
    enumThreshold: 5
  };
  
  let outputFile = null;
  let title = null;

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case '--output':
      case '-o':
        if (!nextArg) {
          console.error('Error: --output requires a value');
          process.exit(1);
        }
        outputFile = nextArg;
        i++; // Skip next argument
        break;
      
      case '--title':
      case '-t':
        if (!nextArg) {
          console.error('Error: --title requires a value');
          process.exit(1);
        }
        title = nextArg;
        i++; // Skip next argument
        break;
      
      case '--no-examples':
        options.includeExamples = false;
        break;
      
      case '--no-format':
        options.detectFormat = false;
        break;
      
      case '--no-required':
        options.requiredByDefault = false;
        break;
      
      case '--additional-props':
        options.additionalProperties = true;
        break;
      
      case '--infer-enums':
        options.inferEnums = true;
        break;
      
      case '--enum-threshold':
        if (!nextArg || isNaN(parseInt(nextArg))) {
          console.error('Error: --enum-threshold requires a numeric value');
          process.exit(1);
        }
        options.enumThreshold = parseInt(nextArg);
        i++; // Skip next argument
        break;
      
      default:
        console.error(`Error: Unknown option ${arg}`);
        process.exit(1);
    }
  }

  // Generate default output filename if not provided
  if (!outputFile) {
    const parsedPath = path.parse(inputFile);
    outputFile = path.join(parsedPath.dir, `${parsedPath.name}.schema.json`);
  }

  // Generate default title if not provided
  if (!title) {
    const parsedPath = path.parse(inputFile);
    title = parsedPath.name.charAt(0).toUpperCase() + parsedPath.name.slice(1);
  }

  return { inputFile, outputFile, title, options };
}

function main() {
  try {
    const { inputFile, outputFile, title, options } = parseArgs();

    // Check if input file exists
    if (!fs.existsSync(inputFile)) {
      console.error(`Error: Input file "${inputFile}" does not exist`);
      process.exit(1);
    }

    // Read and parse JSON file
    console.log(`Reading JSON from: ${inputFile}`);
    const jsonContent = fs.readFileSync(inputFile, 'utf8');
    
    let jsonData;
    try {
      jsonData = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error(`Error: Invalid JSON in file "${inputFile}"`);
      console.error(parseError.message);
      process.exit(1);
    }

    // Build schema
    console.log('Generating JSON schema...');
    const builder = new JsonSchemaBuilder(options);
    const schema = builder.build(jsonData, title);

    // Write schema to output file
    console.log(`Writing schema to: ${outputFile}`);
    const outputDir = path.dirname(outputFile);
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputFile, JSON.stringify(schema, null, 2));
    
    console.log('✅ JSON schema generated successfully!');
    console.log(`📄 Input: ${inputFile}`);
    console.log(`📋 Output: ${outputFile}`);
    console.log(`🏷️  Title: ${title}`);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();