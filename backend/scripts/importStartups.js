// Script to import static startup data into MongoDB (ESM version)
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import Startup from '../models/Startup.js';

// For __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file
const envPath = path.resolve(__dirname, '../.env');
// Remove debug code for .env file
// dotenv.config({ path: envPath });
dotenv.config({ path: envPath });

const DATA_PATH = path.resolve(__dirname, '../../src/data/startups.ts');

// Function to extract the startupData array from the TypeScript file
function extractStartupData(tsFilePath) {
  const fileContent = fs.readFileSync(tsFilePath, 'utf-8');
  // Use a simple regex to extract the array (not a full TS parser)
  const match = fileContent.match(/export const startupData: Startup\[\] = (\[.*?\]);/s);
  if (!match) throw new Error('Could not find startupData array in file');
  // Evaluate the array as JS (safe because it's static data)
  // Replace TS-specific syntax (true/false, trailing commas)
  let arrayStr = match[1]
    .replace(/([a-zA-Z0-9_]+):/g, '"$1":') // keys to strings
    .replace(/true/g, 'true')
    .replace(/false/g, 'false');
  return JSON.parse(arrayStr);
}

async function importStartups() {
    const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI not set in environment variables');
  }
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  const startups = extractStartupData(DATA_PATH);
  // Remove 'id' field from each startup object
  const startupsToInsert = startups.map(({ id, ...rest }) => rest);
  await Startup.deleteMany({});
  await Startup.insertMany(startupsToInsert);
  console.log('Imported startups:', startupsToInsert.length);
  await mongoose.disconnect();
}

importStartups().catch(err => {
  console.error(err);
  process.exit(1);
});