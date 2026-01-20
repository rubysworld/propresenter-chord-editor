const { parseProPresenterFile } = require('./build/server/chunks/internal.js');
const fs = require('fs');
const path = require('path');

async function debug() {
  const testFilePath = path.join(__dirname, 'src/lib/__tests__', 'test-song.pro');
  const buffer = await fs.promises.readFile(testFilePath);
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  
  try {
    const doc = await parseProPresenterFile(arrayBuffer);
    console.log('Document name:', doc.name);
    console.log('Slides count:', doc.slides.length);
    console.log('Slides:', JSON.stringify(doc.slides, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

debug();
