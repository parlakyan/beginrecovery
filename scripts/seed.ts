#!/usr/bin/env node

import { seedDatabase } from '../src/utils/seedDatabase.js';

console.log('Starting seed script...');
seedDatabase()
  .then(() => {
    console.log('Seed script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error running seed script:', error);
    process.exit(1);
  });
