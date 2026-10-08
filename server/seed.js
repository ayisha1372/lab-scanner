// Usage: npm run seed          (adds missing sample data, never deletes)
//        npm run seed:reset    (wipes students, systems, sessions, admins first)
require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');
const System = require('./models/System');
const Session = require('./models/Session');
const Admin = require('./models/Admin');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  if (process.argv.includes('--reset')) {
    await Promise.all([Student.deleteMany({}), System.deleteMany({}), Session.deleteMany({}), Admin.deleteMany({})]);
    console.log('Collections cleared');
  }
  await Promise.all([Student.init(), System.init(), Session.init(), Admin.init()]); // make sure indexes exist

  const students = [
    { admissionNo: 'ADM001', name: 'Student One', course: 'BCA', batch: 'A' },
    { admissionNo: 'ADM002', name: 'Student Two', course: 'BCA', batch: 'A' },
    { admissionNo: 'ADM003', name: 'Student Three', course: 'BSc CS', batch: 'B' },
  ];
  for (const s of students) await Student.updateOne({ admissionNo: s.admissionNo }, { $setOnInsert: s }, { upsert: true });

  for (let i = 1; i <= 5; i++) {
    const n = `PC-${String(i).padStart(2, '0')}`;
    await System.updateOne({ systemNumber: n }, { $setOnInsert: { systemNumber: n, name: `Computer ${i}`, location: 'Main Lab', status: 'available' } }, { upsert: true });
  }

  const username = (process.env.SEED_ADMIN_USERNAME || 'admin').toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';
  if (!(await Admin.exists({ username }))) {
    await Admin.create({ username, passwordHash: await Admin.hash(password), role: 'superadmin' });
    console.log(`Admin created -> username: ${username}`);
  } else {
    console.log('Admin already exists, left unchanged');
  }

  console.log('Seed complete: 3 students, 5 systems');
  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
