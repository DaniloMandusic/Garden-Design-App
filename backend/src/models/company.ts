import mongoose, { Schema } from 'mongoose';
import ServiceModel from './service';

let CompanySchema = new Schema({
    name: String,
    address: String,
    phone: String,
    worktime: String,
    freeWorkers: String,
    //services: [ServiceModel],
    contactPerson: String,
    vacationStart: String,
    vacationEnd: String,
    
});

const CompanyModel = mongoose.model('Company', CompanySchema);

export default CompanyModel;