/**
 * Node.js-specific protobuf loader for testing
 */

import protobuf from 'protobufjs';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cached proto root
let protoRoot: protobuf.Root | null = null;

/**
 * Load protobuf definitions from filesystem (Node.js only)
 */
export async function loadProtoDefinitionsNode(): Promise<protobuf.Root> {
  if (protoRoot) return protoRoot;

  const protoDir = path.resolve(__dirname, '../../proto/Proto 19beta');
  
  protoRoot = new protobuf.Root();
  
  // Set resolvePath to handle imports within proto files
  protoRoot.resolvePath = (origin, target) => {
    // Resolve relative imports to proto directory
    return path.join(protoDir, target);
  };

  // Load the main presentation proto file - it will pull in dependencies
  try {
    // Use chdir to avoid path doubling issue
    const originalDir = process.cwd();
    process.chdir(protoDir);
    
    await protoRoot.load('presentation.proto', { keepCase: true });
    
    process.chdir(originalDir);
  } catch (e) {
    console.error('Failed to load proto definitions:', e);
    throw e;
  }

  return protoRoot;
}
