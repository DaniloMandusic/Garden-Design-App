import mongoose, { Schema } from 'mongoose';

let ServiceSchema = new Schema({
    name: { type: String, require: true },
    company: { type: String, require: true },
    price: String,
});

const ServiceModel = mongoose.model('Service', ServiceSchema);

export default ServiceModel;
