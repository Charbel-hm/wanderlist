const mongoose = require('mongoose');
require('dotenv').config();

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB via Migration Script');

        const collection = mongoose.connection.collection('users');

        // Update all users who still have the old 'flagGameHighScores' field
        const result = await collection.updateMany(
            { flagGameHighScores: { $exists: true } },
            [
                {
                    $set: {
                        flagGameHighScore: {
                            $max: [
                                { $ifNull: ["$flagGameHighScores.timeAttack", 0] },
                                { $ifNull: ["$flagGameHighScores.hard", 0] },
                                { $ifNull: ["$flagGameHighScores.medium", 0] },
                                { $ifNull: ["$flagGameHighScores.easy", 0] }
                            ]
                        }
                    }
                },
                {
                    $unset: "flagGameHighScores"
                }
            ]
        );

        console.log(`Migration Complete.`);
        console.log(`Matched & Updated: ${result.modifiedCount} documents.`);

        process.exit(0);
    } catch (err) {
        console.error('Migration Failed:', err);
        process.exit(1);
    }
};

migrate();
