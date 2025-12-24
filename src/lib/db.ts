import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI as string);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
    } catch (error : Error | any) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
        
    }
};
export default connectDB;