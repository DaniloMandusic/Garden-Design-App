import mongoose from 'mongoose';

const uri = 'mongodb://localhost:27017/piajul';

const connectToDatabase = async () => {
  try {
    await mongoose.connect(uri);
    //console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
};

export default connectToDatabase;