import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
    username: {type: String, required: true},
    movieId: {type: Number, required: true},
    reviews: [{
        id: {type: Number, required: true},
        author: {type: String, required: true},
        rating: {type: Number, required: true},
        content: {type: String, required: true},
    }],
});

ReviewSchema.statics.findByUserName = function (username) {
    return this.find({ username: username }).then(docs => docs.map(doc => doc.movieId));
};

ReviewSchema.statics.findByUserNameAndMovieId = function (username, movieId) {
    return this.findOne({username: username, movieId: movieId});
};

ReviewSchema.statics.findByUserNameMovieIdAndReviewId = function (username, movieId,reviewId) {
    return this.findOne({
        username: username,
        movieId: movieId,
        'reviews.id': reviewId
    }, {
        'reviews.$': 1
    });
};

export default mongoose.model('Review', ReviewSchema);