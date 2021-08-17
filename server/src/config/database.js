import mongoose from "mongoose";

const MONGO_URI = 'mongodb://127.0.0.1:27017/fabric-tokenization-platform'

exports.connect = () => {
    // Connecting to the database
    mongoose
        .connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false,
        })
        .then(() => {
            console.log("Successfully connected to database");
        })
        .catch((error) => {
            console.log("database connection failed. exiting now...");
            console.error(error);
            process.exit(1);
        });
};