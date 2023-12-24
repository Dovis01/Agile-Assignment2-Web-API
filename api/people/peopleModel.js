import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const PeopleSchema = new Schema({
    adult: { type: Boolean },
    gender: { type: Number },
    id: { type: Number, required: true, unique: true },
    known_for_department: { type: String },
    name: { type: String },
    original_name: { type: String },
    popularity: { type: Number },
    profile_path: { type: String },
    known_for: [{
        adult: { type: Boolean },
        backdrop_path: { type: String },
        id: { type: Number, required: true, unique: true },
        title: { type: String },
        original_language: { type: String },
        original_title: { type: String },
        overview: { type: String },
        poster_path: { type: String },
        media_type: { type: String },
        genre_ids: [{ type: Number }],
        popularity: { type: Number },
        release_date: { type: String },
        video: { type: Boolean },
        vote_average: { type: Number },
        vote_count: { type: Number },
    }]
});

PeopleSchema.statics.findByPeopleId = function (id) {
    return this.findOne({ id: id });
};

export default mongoose.model('People', PeopleSchema, 'people');