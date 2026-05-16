import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Item from './models/Item.js';
import { applyTrustScore } from './utils/calcTrustScore.js';
import { resolveMongoUri } from './config/db.js';

const brooklyn = [-73.9442, 40.6782];
const parkSlope = [-73.9906, 40.6681];
const williamsburg = [-73.9603, 40.7183];

async function seed() {
  const uri = resolveMongoUri();
  await mongoose.connect(uri);
  await Promise.all([
    User.deleteMany({ email: /@kindred\.local$/ }),
    Item.deleteMany({ title: { $in: ['Cordless Drill Kit', 'Stand Mixer', 'Bike Pump', 'Garden Trowel Set', 'Spanish Tutoring'] } }),
  ]);

  const pass = await bcrypt.hash('password123', 12);

  const maya = await User.create({
    name: 'Maya Chen',
    email: 'maya@kindred.local',
    password: pass,
    bio: 'Weekend gardener and DIY enthusiast.',
    avatar: '',
    location: { type: 'Point', coordinates: brooklyn },
    address: '123 Maple St, Brooklyn',
    itemsShared: 2,
    successfulHandoffs: 3,
    helpfulnessVotes: 2,
  });
  applyTrustScore(maya);
  await maya.save();

  const jordan = await User.create({
    name: 'Jordan Lee',
    email: 'jordan@kindred.local',
    password: pass,
    bio: 'Love lending kitchen gear and sharing recipes.',
    location: { type: 'Point', coordinates: parkSlope },
    address: '',
    itemsShared: 4,
    successfulHandoffs: 5,
    helpfulnessVotes: 4,
  });
  applyTrustScore(jordan);
  await jordan.save();

  const sam = await User.create({
    name: 'Sam Rivera',
    email: 'sam@kindred.local',
    password: pass,
    bio: 'Neighborhood bike fixer-upper.',
    location: { type: 'Point', coordinates: williamsburg },
    address: '',
    itemsShared: 1,
    successfulHandoffs: 1,
    helpfulnessVotes: 1,
  });
  applyTrustScore(sam);
  await sam.save();

  await Item.create([
    {
      owner: maya._id,
      title: 'Cordless Drill Kit',
      description: '18V with two batteries. Great for shelves and small repairs.',
      category: 'Tools',
      type: 'lend',
      images: [],
      location: { type: 'Point', coordinates: brooklyn },
      borrowDurationDays: 5,
      condition: 'good',
      tags: ['drill', 'diy'],
    },
    {
      owner: jordan._id,
      title: 'Stand Mixer',
      description: 'Perfect for bread week. Includes dough hook and whisk.',
      category: 'Kitchen',
      type: 'lend',
      images: [],
      location: { type: 'Point', coordinates: parkSlope },
      borrowDurationDays: 3,
      condition: 'good',
      tags: ['baking'],
    },
    {
      owner: sam._id,
      title: 'Bike Pump',
      description: 'Presta and Schrader compatible.',
      category: 'Sports',
      type: 'gift',
      images: [],
      location: { type: 'Point', coordinates: williamsburg },
      condition: 'fair',
      tags: ['bike'],
    },
    {
      owner: maya._id,
      title: 'Garden Trowel Set',
      description: 'Three hand tools, cleaned after each use.',
      category: 'Garden',
      type: 'lend',
      images: [],
      location: { type: 'Point', coordinates: brooklyn },
      borrowDurationDays: 7,
      condition: 'new',
      tags: ['garden'],
    },
    {
      owner: jordan._id,
      title: 'Spanish Tutoring',
      description: '1 hour conversation practice near Prospect Park.',
      category: 'Skills',
      type: 'skill',
      images: [],
      location: { type: 'Point', coordinates: parkSlope },
      borrowDurationDays: 1,
      condition: 'new',
      tags: ['language'],
    },
  ]);

  console.log('Seed complete. Demo logins (password: password123):');
  console.log('  maya@kindred.local, jordan@kindred.local, sam@kindred.local');
  await mongoose.disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
