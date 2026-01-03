#!/usr/bin/env node
/**
 * Migration Script: inMemoryDB → D1
 * Replace all inMemoryDB operations with DatabaseService calls
 */

const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, '../src/index.tsx');

console.log('🚀 Starting migration inMemoryDB → D1...\n');

let content = fs.readFileSync(FILE_PATH, 'utf8');
let changes = 0;

// 1. inMemoryDB.users.get(email) → db.getUserByEmail(email)
content = content.replace(
  /inMemoryDB\.users\.get\(([^)]+)\)/g,
  (match, arg) => {
    changes++;
    return `await db.getUserByEmail(${arg})`;
  }
);

// 2. Array.from(inMemoryDB.users.values()).find(u => u.email === xxx)
content = content.replace(
  /Array\.from\(inMemoryDB\.users\.values\(\)\)\.find\(u => u\.email === ([^)]+)\)/g,
  (match, email) => {
    changes++;
    return `await db.getUserByEmail(${email})`;
  }
);

// 3. Array.from(inMemoryDB.users.values()).find(u => u.id === xxx)
content = content.replace(
  /Array\.from\(inMemoryDB\.users\.values\(\)\)\.find\(u => u\.id === ([^)]+)\)/g,
  (match, id) => {
    changes++;
    return `await db.getUserById(${id})`;
  }
);

// 4. Array.from(inMemoryDB.users.values())
content = content.replace(
  /Array\.from\(inMemoryDB\.users\.values\(\)\)/g,
  () => {
    changes++;
    return `await db.getAllUsers()`;
  }
);

// 5. inMemoryDB.users.set(email, user) → db.createUser(user) or db.updateUser()
// This one is trickier, needs manual review

// 6. inMemoryDB.trips operations
content = content.replace(
  /inMemoryDB\.trips\.get\(([^)]+)\)/g,
  (match, arg) => {
    changes++;
    return `await db.getTripById(${arg})`;
  }
);

content = content.replace(
  /Array\.from\(inMemoryDB\.trips\.values\(\)\)/g,
  () => {
    changes++;
    return `await db.getAllTrips()`;
  }
);

// 7. inMemoryDB.packages operations
content = content.replace(
  /inMemoryDB\.packages\.get\(([^)]+)\)/g,
  (match, arg) => {
    changes++;
    return `await db.getPackageById(${arg})`;
  }
);

content = content.replace(
  /Array\.from\(inMemoryDB\.packages\.values\(\)\)/g,
  () => {
    changes++;
    return `await db.getAllPackages()`;
  }
);

// 8. inMemoryDB.bookings operations
content = content.replace(
  /inMemoryDB\.bookings\.get\(([^)]+)\)/g,
  (match, arg) => {
    changes++;
    return `await db.getTransactionById(${arg})`;
  }
);

fs.writeFileSync(FILE_PATH, content, 'utf8');

console.log(`✅ Migration completed: ${changes} changes made\n`);
console.log('⚠️  Manual review required for:');
console.log('   - inMemoryDB.users.set() operations');
console.log('   - inMemoryDB.trips.set() operations');
console.log('   - inMemoryDB.packages.set() operations');
console.log('   - inMemoryDB.bookings.set() operations');
console.log('\n📝 Please review the file and fix any remaining issues.');
