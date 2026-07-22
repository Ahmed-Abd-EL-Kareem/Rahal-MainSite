const fs = require('fs');
const code = fs.readFileSync('src/components/layout/Header.tsx', 'utf8');
let paren = 0, brace = 0, bracket = 0;
let inString = false, stringChar = '', inTemplate = false;

for (let i = 0; i < code.length; i++) {
  const c = code[i];
  const next = code[i+1];
  
  if (inString) {
    if (c === stringChar && code[i-1] !== '\\') inString = false;
    continue;
  }
  if (inTemplate) {
    if (c === '`' && code[i-1] !== '\\') inTemplate = false;
    else if (c === '$' && next === '{') { brace++; i++; }
    continue;
  }
  
  if (c === '"' || c === "'") { inString = true; stringChar = c; continue; }
  if (c === '`') { inTemplate = true; continue; }
  
  if (c === '(') paren++;
  else if (c === ')') paren--;
  else if (c === '{') brace++;
  else if (c === '}') brace--;
  else if (c === '[') bracket++;
  else if (c === ']') bracket--;
  
  if (paren < 0 || brace < 0 || bracket < 0) {
    console.log('Negative at', i, 'char:', code[i], 'paren:', paren, 'brace:', brace, 'bracket:', bracket);
    console.log('Context:', code.substring(Math.max(0,i-50), i+50));
    break;
  }
}
console.log('Final:', paren, brace, bracket);