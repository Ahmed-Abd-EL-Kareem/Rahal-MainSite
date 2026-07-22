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
  else if (c === '{') brace++;
  else if (c === '}') brace--;
  
  if (paren < 0 || brace < 0) {
    console.log('NEGATIVE at ' + i + ': paren=' + paren + ', brace=' + brace);
    console.log('Context: ' + code.substring(Math.max(0,i-50), i+50));
    break;
  }
  
  if (i % 10000 === 0 && i > 0) {
    console.log('At ' + i + ': paren=' + paren + ', brace=' + brace);
  }
}
console.log('Final: paren=' + paren + ', brace=' + brace);