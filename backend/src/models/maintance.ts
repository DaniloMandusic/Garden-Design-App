import mongoose, { Schema } from 'mongoose';

let MaintanceSchema = new Schema({
    lastDate: String,
    lastTime: String,
    nextDate: String,
    nextTime: String,
    status: String,
    user: String,
    
});

const MaintanceModel = mongoose.model('Maintance', MaintanceSchema);

export default MaintanceModel;