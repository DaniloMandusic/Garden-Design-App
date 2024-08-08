import mongoose, { Schema } from 'mongoose';

let ArrangementSchema = new Schema({
    user: String,
    company: String,
    date: String,
    sqfeet: String,
    gardenType: String,
    poolsqf: String,
    greensqf: String,
    waterfsqf: String,
    restsqf: String,
    numOfTables: String,
    description: String,
    json: String, // json file za mapu baste
    status: String,
    numberOfPools: String,
    numberOfWaterFeatures: String,
    decorator: String,
    
});

const ArrangementModel = mongoose.model('Arrangement', ArrangementSchema);

export default ArrangementModel;
