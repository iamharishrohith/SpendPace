const fs = require('fs');
const content = fs.readFileSync('C:/Users/ipsha/.gemini/antigravity/brain/75dcc68f-0e95-43ab-a0d9-70e1ef817bea/.system_generated/steps/4684/content.md', 'utf8');
const apks = content.match(/https:\/\/[^\"'\s<>]+\.apk/g);
console.log('APKs:', apks);
const status = content.match(/status[:\"]\s*\"?([A-Za-z_]+)\"?/i) || content.match(/(finished|in progress|in queue|errored|failed)/i);
console.log('Status:', status ? status[0] : 'not found');
