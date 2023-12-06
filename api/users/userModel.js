import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: { type: String, unique: true, required: true},
    password: {type: String, required: true }
});
UserSchema.pre('save', async function(next) {
    const saltRounds = 10; // You can adjust the number of salt rounds
    //const user = this;
    if (this.isModified('password') || this.isNew) {
        try {
            const hash = await bcrypt.hash(this.password, saltRounds);
            this.password = hash;
            next();
        } catch (error) {
            next(error);
        }

    } else {
        next();
    }
});

UserSchema.methods.comparePassword = async function (passw) {
    return await bcrypt.compare(passw, this.password);

}
UserSchema.statics.findByUserName = function (username) {
    return this.findOne({ username: username });
};

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,15}$/;
const passwordValidator = (password) => {
    return passwordRegex.test(password);
}
UserSchema.path("password").validate(passwordValidator, "Password must be between 8 and 15 characters long and contain at least one number, one letter and one special character.");
export default mongoose.model('User', UserSchema);