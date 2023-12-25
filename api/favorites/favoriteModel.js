import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const FavoriteSchema = new Schema({
    username: {type: String, unique: true, required: true},
    favorites: [{type: Number, required: true}],
});

FavoriteSchema.statics.findByUserName = function (username) {
    return this.findOne({ username: username });
};

export default mongoose.model('Favorite', FavoriteSchema);