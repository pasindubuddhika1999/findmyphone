const axios = require('axios');

// Configure API URL
const API_URL = process.env.API_URL || 'http://localhost:5000';

// Function to seed data
async function seedData() {
  try {
    console.log('Starting database seeding process...');
    
    // Step 1: Seed phone brands
    console.log('Seeding phone brands...');
    const brandsResponse = await axios.get(`${API_URL}/api/posts/seed-phone-brands`);
    console.log(brandsResponse.data.message);
    
    // Step 2: Seed phone models
    console.log('Seeding phone models...');
    const modelsResponse = await axios.get(`${API_URL}/api/posts/seed-phone-models`);
    console.log(modelsResponse.data.message);
    
    // Step 3: Seed phone colors
    console.log('Seeding phone colors...');
    const colorsResponse = await axios.get(`${API_URL}/api/posts/seed-phone-colors`);
    console.log(colorsResponse.data.message);
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Seeding error:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run the seeding process
seedData(); 