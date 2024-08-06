import mongoose, { Schema } from 'mongoose';

let UserSchema = new Schema({
    username: String,
    password: String,
    firstName: String,
    lastName: String,
    gender: String,

    address: String,
    phone: String,
    email: String,
    profilePicture: Buffer,
    profilePictureUrl: String,

    profileType: String,
    profileStatus: String,

    company: String,

    creditCardNumber: String,

    oldUsername: String
});

const UserModel = mongoose.model('User', UserSchema);

export default UserModel;
