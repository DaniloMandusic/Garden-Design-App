const crypto = require('crypto');

// Your secret encryption key (keep this secure)
const secretKey = 'your-secret-key';

// Function to encrypt a password
function encryptPassword(password: any) {
    const cipher = crypto.createCipher('aes-256-cbc', secretKey);
    let encryptedPassword = cipher.update(password, 'utf-8', 'hex');
    encryptedPassword += cipher.final('hex');
    return encryptedPassword;
}

// Function to decrypt a password
function decryptPassword(encryptedPassword: any) {
    const decipher = crypto.createDecipher('aes-256-cbc', secretKey);
    let decryptedPassword = decipher.update(encryptedPassword, 'hex', 'utf-8');
    decryptedPassword += decipher.final('utf-8');
    return decryptedPassword;
}

export {
    encryptPassword, decryptPassword
};