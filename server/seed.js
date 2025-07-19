const axios = require('axios');
const mongoose = require('mongoose');
const PhoneBrand = require('./models/PhoneBrand');
const PhoneModel = require('./models/PhoneModel');
const PhoneColor = require('./models/PhoneColor');
const District = require('./models/District');
const Town = require('./models/Town');
require('dotenv').config();

// Configure API URL
const API_URL = process.env.API_URL || 'https://find-my-phonelk-production-16ff.up.railway.app';

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

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
  }
}

// Seed districts
async function seedDistricts() {
  console.log('Seeding districts...');
  try {
    // Check if districts already exist
    const count = await District.countDocuments();
    if (count > 0) {
      console.log(`Districts already seeded (${count} found)`);
      return;
    }

    // Sample districts
    const districts = [
      { name: 'Colombo', isActive: true },
      { name: 'Gampaha', isActive: true },
      { name: 'Kalutara', isActive: true },
      { name: 'Kandy', isActive: true },
      { name: 'Matale', isActive: true },
      { name: 'Nuwara Eliya', isActive: true },
      { name: 'Galle', isActive: true },
      { name: 'Matara', isActive: true },
      { name: 'Hambantota', isActive: true },
      { name: 'Jaffna', isActive: true },
      { name: 'Kilinochchi', isActive: true },
      { name: 'Mannar', isActive: true },
      { name: 'Vavuniya', isActive: true },
      { name: 'Mullaitivu', isActive: true },
      { name: 'Batticaloa', isActive: true },
      { name: 'Ampara', isActive: true },
      { name: 'Trincomalee', isActive: true },
      { name: 'Kurunegala', isActive: true },
      { name: 'Puttalam', isActive: true },
      { name: 'Anuradhapura', isActive: true },
      { name: 'Polonnaruwa', isActive: true },
      { name: 'Badulla', isActive: true },
      { name: 'Monaragala', isActive: true },
      { name: 'Ratnapura', isActive: true },
      { name: 'Kegalle', isActive: true }
    ];

    await District.insertMany(districts);
    console.log(`${districts.length} districts seeded successfully`);
  } catch (error) {
    console.error('Error seeding districts:', error);
  }
}

// Seed towns
async function seedTowns() {
  console.log('Seeding towns...');
  try {
    // Check if towns already exist
    const count = await Town.countDocuments();
    if (count > 0) {
      console.log(`Towns already seeded (${count} found)`);
      return;
    }

    // Get all districts
    const districts = await District.find();
    if (districts.length === 0) {
      console.log('No districts found. Please seed districts first.');
      return;
    }

    // Function to find district by name
    const findDistrictByName = (name) => {
      const district = districts.find(d => d.name === name);
      if (!district) {
        console.error(`District "${name}" not found`);
        return null;
      }
      return district;
    };

    // Sample towns with their districts
    const towns = [
      // Colombo district towns
      { name: 'Colombo', district: findDistrictByName('Colombo')?._id, isActive: true },
      { name: 'Dehiwala', district: findDistrictByName('Colombo')?._id, isActive: true },
      { name: 'Moratuwa', district: findDistrictByName('Colombo')?._id, isActive: true },
      { name: 'Kotte', district: findDistrictByName('Colombo')?._id, isActive: true },
      { name: 'Kaduwela', district: findDistrictByName('Colombo')?._id, isActive: true },
      { name: 'Homagama', district: findDistrictByName('Colombo')?._id, isActive: true },
      { name: 'Maharagama', district: findDistrictByName('Colombo')?._id, isActive: true },
      { name: 'Kesbewa', district: findDistrictByName('Colombo')?._id, isActive: true },
      { name: 'Kolonnawa', district: findDistrictByName('Colombo')?._id, isActive: true },
      { name: 'Nugegoda', district: findDistrictByName('Colombo')?._id, isActive: true },

      // Gampaha district towns
      { name: 'Gampaha', district: findDistrictByName('Gampaha')?._id, isActive: true },
      { name: 'Negombo', district: findDistrictByName('Gampaha')?._id, isActive: true },
      { name: 'Ja-Ela', district: findDistrictByName('Gampaha')?._id, isActive: true },
      { name: 'Wattala', district: findDistrictByName('Gampaha')?._id, isActive: true },
      { name: 'Kelaniya', district: findDistrictByName('Gampaha')?._id, isActive: true },
      { name: 'Minuwangoda', district: findDistrictByName('Gampaha')?._id, isActive: true },
      { name: 'Kadawatha', district: findDistrictByName('Gampaha')?._id, isActive: true },
      { name: 'Nittambuwa', district: findDistrictByName('Gampaha')?._id, isActive: true },

      // Kandy district towns
      { name: 'Kandy', district: findDistrictByName('Kandy')?._id, isActive: true },
      { name: 'Peradeniya', district: findDistrictByName('Kandy')?._id, isActive: true },
      { name: 'Katugastota', district: findDistrictByName('Kandy')?._id, isActive: true },
      { name: 'Gampola', district: findDistrictByName('Kandy')?._id, isActive: true },
      { name: 'Nawalapitiya', district: findDistrictByName('Kandy')?._id, isActive: true },
      { name: 'Pilimatalawa', district: findDistrictByName('Kandy')?._id, isActive: true },
      { name: 'Kundasale', district: findDistrictByName('Kandy')?._id, isActive: true },

      // Galle district towns
      { name: 'Galle', district: findDistrictByName('Galle')?._id, isActive: true },
      { name: 'Ambalangoda', district: findDistrictByName('Galle')?._id, isActive: true },
      { name: 'Hikkaduwa', district: findDistrictByName('Galle')?._id, isActive: true },
      { name: 'Bentota', district: findDistrictByName('Galle')?._id, isActive: true },
      { name: 'Elpitiya', district: findDistrictByName('Galle')?._id, isActive: true }
    ];

    // Filter out towns with null district IDs
    const validTowns = towns.filter(town => town.district !== null);

    if (validTowns.length === 0) {
      console.log('No valid towns to seed. Check district names.');
      return;
    }

    await Town.insertMany(validTowns);
    console.log(`${validTowns.length} towns seeded successfully`);
  } catch (error) {
    console.error('Error seeding towns:', error);
  }
}

// Run all seed functions
async function seedAll() {
  try {
    await connectDB();
    // await seedData(); // Commenting out as it's using external API
    await seedDistricts();
    await seedTowns();
    console.log('All seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedAll(); 