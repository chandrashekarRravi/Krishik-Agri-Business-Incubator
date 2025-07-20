import { writeFileSync } from 'fs';
// Use tsx to allow TypeScript import
const { productData } = await import('../src/data/products.ts');
writeFileSync('./src/data/products.json', JSON.stringify(productData, null, 2));
console.log('products.json generated successfully!'); 