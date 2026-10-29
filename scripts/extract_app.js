const fs = require('fs');

const lines = fs.readFileSync('d:/Shortfundly/spendpace/scripts/create_full_app.js', 'utf8').split('\n');
// Line index 2 starts "const fullCode = `import React..."
let code = lines.slice(2, 3708).join('\n');
code = code.replace(/^const fullCode = `/, '');
// Replace \` with ` and \$ with $
code = code.split('\\`').join('`').split('\\$').join('$');

fs.writeFileSync('d:/Shortfundly/spendpace-expo/App.js', code, 'utf8');
console.log('Wrote App.js, total lines:', code.split('\n').length);

const parser = require('@babel/parser');
try {
  parser.parse(code, { sourceType: 'module', plugins: ['jsx'] });
  console.log('SUCCESS! ALL SYNTAX 100% VALID! ZERO ERRORS!');
} catch (e) {
  console.error('Parse error:', e.message, 'at line', e.loc ? e.loc.line : '?');
}
