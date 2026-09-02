const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Vendor = require('../models/Vendor');

dotenv.config();

const normalizeCategories = (values) => {
  const uniqueCategories = new Map();

  values.forEach((value) => {
    if (typeof value !== 'string') return;
    const category = value.trim();
    if (category) uniqueCategories.set(category.toLowerCase(), category);
  });

  return [...uniqueCategories.values()];
};

const migrateVendorCategories = async () => {
  try {
    await connectDB();

    const vendors = await Vendor.find({ service: { $exists: true } })
      .select('_id service categories')
      .lean();

    let migratedCount = 0;
    for (const vendor of vendors) {
      const categories = normalizeCategories([
        ...(Array.isArray(vendor.categories) ? vendor.categories : []),
        ...(Array.isArray(vendor.service) ? vendor.service : [vendor.service])
      ]);

      await Vendor.collection.updateOne(
        { _id: vendor._id },
        { $set: { categories }, $unset: { service: '' } }
      );
      migratedCount += 1;
    }

    console.log(`Migrated ${migratedCount} vendor records to the categories field.`);
  } catch (error) {
    console.error('Vendor category migration failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

migrateVendorCategories();
