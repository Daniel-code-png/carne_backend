require('dotenv').config();

const mongoose = require('mongoose');
const University = require('../modules/universites/models/University');
const Equipment = require('../modules/equipment/models/Equipment');
const Loan = require('../modules/loans/models/Loan');
const User = require('../modules/user/models/User');

const DEFAULT_SLUG = process.argv[2] || 'unicatolica';

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const university = await University.findOne({ slug: DEFAULT_SLUG, isActive: true });
    if (!university) {
      throw new Error(`Universidad no encontrada: ${DEFAULT_SLUG}`);
    }

    const equipmentMissingStatus = await Equipment.updateMany(
      {
        $or: [
          { status: { $exists: false } },
          { status: null },
          { status: undefined },
          { status: '' },
        ],
      },
      { $set: { status: 'disponible' } }
    );

    const equipmentMissingUniversity = await Equipment.updateMany(
      {
        $or: [
          { university: { $exists: false } },
          { university: null },
          { university: undefined },
        ],
      },
      { $set: { university: university._id } }
    );

    const targets = [
      { model: Equipment, name: 'Equipment' },
      { model: Loan, name: 'Loan' },
      { model: User, name: 'User' },
    ];

    const results = [];
    for (const { model, name } of targets) {
      const result = await model.updateMany(
        { $or: [{ university: { $exists: false } }, { university: null }, { university: undefined }] },
        { $set: { university: university._id } }
      );
      results.push({ name, modifiedCount: result.modifiedCount, matchedCount: result.matchedCount });
    }

    console.log(JSON.stringify({
      university: { id: university._id.toString(), slug: university.slug },
      equipmentMissingStatus,
      equipmentMissingUniversity,
      results,
    }, null, 2));

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error al corregir universidades faltantes:', error.message);
    process.exit(1);
  }
})();
