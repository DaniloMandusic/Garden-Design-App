import mongoose, { Schema } from 'mongoose';

let ServiceSchema = new Schema({
    name: String,
    company: String,
    price: String,
    
});

const ServiceModel = mongoose.model('Service', ServiceSchema);

export default ServiceModel;