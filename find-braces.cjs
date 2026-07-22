const fs = require('fs');
const code = fs.readFileSync('src/components/layout/Header.tsx', 'utf8');
let paren = 0, brace = 0, inString = false, stringChar = '', inTemplate = false;

for (let i = 0; i < code.length; i++) {
  const c = code[i];
  
  if (inString) {
    if (c === stringChar && code[i-1] !== '\\') inString = false;
    continue;
  }
  if (inTemplate) {
    if (c === '`' && code[i-1] !== '\\') inTemplate = false;
    else if (c === '$' && code[i+1] === '{') { brace++; i++; }
    continue;
  }
  if (c === '"' || c === "'") { inString = true; stringChar = c; continue; }
  if (c === '`') { inTemplate = true; continue; }
  
  if (c === '(') paren++;
  else if (c === ')') paren--;
  else if (c === '{') { 
    brace++; 
    console.log('OPEN BRACE at ' + i + ': ' + code.substring(Math.max(0,i-40), i+40).replace(/\n/g, '\\n')); 
  }
  else if (c === '}') { 
    brace--; 
    console.log('CLOSE BRACE at ' + i + ': ' + code.substring(Math.max(0,i-40), i+40).replace(/\n/g, '\\n')); 
  }
}
console.log('Final: paren=' + paren + ', brace=' + brace);