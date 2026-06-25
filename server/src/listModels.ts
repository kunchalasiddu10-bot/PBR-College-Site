import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config({ path: path.join(__dirname, '../.env') });

const run = async () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set in .env');
    process.exit(1);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // We can list models using fetch directly or check ListModels
    console.log('Fetching available models from Gemini API...');
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const res = await fetch(url);
    const data: any = await res.json();
    
    if (!res.ok) {
      console.error('Error listing models:', data);
      process.exit(1);
    }
    
    console.log('Available models:');
    if (data.models) {
      data.models.forEach((m: any) => {
        console.log(`- ${m.name} | Supported Actions: ${m.supportedGenerationMethods}`);
      });
    } else {
      console.log('No models returned. Response data:', data);
    }
  } catch (error: any) {
    console.error('Failed to list models:', error);
  }
};

run();
