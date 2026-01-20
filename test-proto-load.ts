import protobuf from 'protobufjs';
import * as path from 'path';

async function test() {
  const protoDir = path.resolve('./proto/Proto 19beta');
  console.log('Proto dir:', protoDir);
  
  const root = new protobuf.Root();
  root.resolvePath = (_origin, target) => {
    return path.join(protoDir, target);
  };

  try {
    const fullPath = path.join(protoDir, 'presentation.proto');
    console.log('Loading from:', fullPath);
    await root.load(fullPath, { keepCase: true });
    console.log('Loaded successfully!');
    console.log('Types:', root.nestedArray.map((n: any) => n.fullName));
  } catch (e) {
    console.error('Failed to load:', e);
    
    // Try without resolvePath
    console.log('\nTrying without resolvePath...');
    const root2 = new protobuf.Root();
    try {
      await root2.load(path.join(protoDir, 'presentation.proto'), { keepCase: true });
      console.log('Success without resolvePath!');
      console.log('Types:', root2.nestedArray.map((n: any) => n.fullName));
    } catch (e2) {
      console.error('Also failed:', e2);
    }
  }
}

test();
