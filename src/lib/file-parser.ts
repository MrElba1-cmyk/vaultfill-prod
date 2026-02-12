const pdf = require('pdf-parse');
import mammoth from 'mammoth';

export async function parseFileToText(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === 'application/pdf') {
    // Standard PDF-parse fix for Node environments
    const data = await pdf(buffer, { pagerender: () => "" });
    return data.text;
  } 
  
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (mimeType === 'text/plain') {
    return buffer.toString('utf-8');
  }

  throw new Error('Unsupported format for autonomous parsing.');
}
