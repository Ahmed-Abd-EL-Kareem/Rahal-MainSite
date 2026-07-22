const fs = require('fs');
const code = fs.readFileSync('src/components/layout/Header.tsx', 'utf8');
let paren = 0, brace = 0, inString = false, stringChar = '';

for (let i = 0; i < code.length; i++) {
  const c = code[i];
  
  if (inString) {
    if (c === stringChar && code[i-1] !== '\\') inString = false;
    continue;
  }
  if (c === '"' || c === "'") {
    if (code[i-1] !== '\\') { inString = true; stringChar = c; }
    continue;
  }
  if (c === '`') continue; // skip template literals for simplicity
  
  if (c === '(') paren++;
  else if (c === ')') paren--;
  else if (c === '{') brace++;
  else if (c === '}') brace--;
  
  if (i % 5000 === 0 && i > 0) {
    console.log('At ' + i + ': paren=' + paren + ', brace=' + brace);
  }
}
console.log('Final: paren=' + paren + ', brace=' + brace);