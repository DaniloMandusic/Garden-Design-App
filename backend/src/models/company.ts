import mongoose, { Schema } from 'mongoose';
import ServiceModel from './service';

interface ICompany {
    name: String,
    address: String,
    phone: String,
    worktime: String,
    freeWorkers: String,
    //services: [ServiceModel],
    contactPerson: String,
    vacationStart: String,
    vacationEnd: String,
}

let CompanySchema = new Schema({
    name: { type: String, unique: true },
    address: String,
    phone: String,
    worktime: String,
    freeWorkers: String,
    //services: [ServiceModel],
    contactPerson: String,
    vacationStart: String,
    vacationEnd: String,
    
});

const CompanyModel = mongoose.model<ICompany>('Company', CompanySchema);

export default CompanyModel;
