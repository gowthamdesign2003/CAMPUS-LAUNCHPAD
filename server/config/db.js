import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGO_URI || '';
  if (!uri) throw new Error('MONGO_URI not set');
  mongoose.set('strictQuery', true);
  mongoose.set('bufferCommands', false);
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    const msg = error?.message || '';
    if (msg.toLowerCase().includes('not authorized') || msg.toLowerCase().includes('not whitelisted') || msg.toLowerCase().includes('atlas')) {
      console.error('MongoDB Atlas connection failed. Check IP whitelist and user credentials.');
    }
    throw error;
  }
};

export default connectDB;
