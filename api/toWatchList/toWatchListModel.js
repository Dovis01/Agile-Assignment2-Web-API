import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const ToWatchListSchema = new Schema({
    username: {type: String, unique: true, required: true},
    toWatchList: [{type: Number, required: true}],
});

ToWatchListSchema.statics.findByUserName = function (username) {
    return this.findOne({ username: username });
};

export default mongoose.model('ToWatchList', ToWatchListSchema, 'toWatchList');