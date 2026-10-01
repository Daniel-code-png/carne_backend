require('dotenv').config();

const mongoose = require('mongoose');
const University = require('../modules/universites/models/University');
const Equipment = require('../modules/equipment/models/Equipment');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const slug = process.argv[2] || 'unicatolica';
    const university = await University.findOne({ slug, isActive: true });
    if (!university) {
      throw new Error(`Universidad no encontrada: ${slug}`);
    }

    const invalidStatus = await Equipment.updateMany(
      {
        university: university._id,
        $or: [
          { status: { $exists: false } },
          { status: null },
          { status: '' },
          { status: { $nin: ['disponible', 'prestado', 'dañado', 'mantenimiento'] } },
        ],
      },
      { $set: { status: 'disponible' } }
    );

    const docs = await Equipment.find({ university: university._id }).select('_id name code status isActive university').lean();
    console.log(JSON.stringify({
      slug,
      universityId: String(university._id),
      invalidStatus,
      count: docs.length,
      docs,
    }, null, 2));

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('ERROR:', error.message);
    process.exit(1);
  }
})();
