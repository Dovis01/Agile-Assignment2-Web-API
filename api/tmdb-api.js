import fetch from 'node-fetch';

export const getDiscoverMovies = (page) => {
    const pageLast = page * 2;
    const pageFirst = pageLast - 1;

    return Promise.all([
        fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${process.env.REACT_APP_TMDB_KEY}&language=en-US&include_adult=false&include_video=false&page=${pageFirst}`),
        fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${process.env.REACT_APP_TMDB_KEY}&language=en-US&include_adult=false&include_video=false&page=${pageLast}`)
    ])
        .then(responses => {
            for (const response of responses) {
                if (!response.ok) {
                    throw new Error('Problem fetching movies');
                }
            }
            return Promise.all(responses.map(response => response.json()));
        })
        .then(data => {
            const moviesPage1 = data[0].results || [];
            const moviesPage2 = data[1].results || [];
            const combinedMovies = [...moviesPage1, ...moviesPage2];

            return {
                page: page,
                results: combinedMovies,
                total_results: 10000,
                total_pages: 250
            };
        })
        .catch((error) => {
            throw error;
        });
};

export const getUpcomingMovies = (page) => {
    const pageLast = page * 2;
    const pageFirst = pageLast - 1;

    return Promise.all([
        fetch(`https://api.themoviedb.org/3/movie/upcoming?api_key=${process.env.REACT_APP_TMDB_KEY}&language=en-US&page=${pageFirst}`),
        fetch(`https://api.themoviedb.org/3/movie/upcoming?api_key=${process.env.REACT_APP_TMDB_KEY}&language=en-US&page=${pageLast}`)
    ])
        .then(responses => {
            for (const response of responses) {
                if (!response.ok) {
                    throw new Error('Problem fetching movies');
                }
            }
            return Promise.all(responses.map(response => response.json()));
        })
        .then(data => {
            const moviesPage1 = data[0].results || [];
            const moviesPage2 = data[1].results || [];
            const combinedMovies = [...moviesPage1, ...moviesPage2];

            return {
                page: page,
                results: combinedMovies,
                total_results: 537,
                total_pages: 14
            };
        })
        .catch((error) => {
            throw error;
        });
};


export const getNowPlayingMovies = (page) => {
    const pageLast = page * 2;
    const pageFirst = pageLast - 1;

    return Promise.all([
        fetch(`https://api.themoviedb.org/3/movie/now_playing?api_key=${process.env.REACT_APP_TMDB_KEY}&language=en-US&page=${pageFirst}`),
        fetch(`https://api.themoviedb.org/3/movie/now_playing?api_key=${process.env.REACT_APP_TMDB_KEY}&language=en-US&page=${pageLast}`)
    ])
        .then(responses => {
            for (const response of responses) {
                if (!response.ok) {
                    throw new Error('Problem fetching movies');
                }
            }
            return Promise.all(responses.map(response => response.json()));
        })
        .then(data => {
            const moviesPage1 = data[0].results || [];
            const moviesPage2 = data[1].results || [];
            const combinedMovies = [...moviesPage1, ...moviesPage2];

            return {
                page: page,
                results: combinedMovies,
                total_results: 2003,
                total_pages: 51
            };
        })
        .catch((error) => {
            throw error;
        });
};

export const getWeekTrendingMovies = (page) => {
    const pageLast = page * 2;
    const pageFirst = pageLast - 1;

    return Promise.all([
        fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${process.env.REACT_APP_TMDB_KEY}&language=en-US&include_adult=false&include_video=false&page=${pageFirst}`),
        fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${process.env.REACT_APP_TMDB_KEY}&language=en-US&include_adult=false&include_video=false&page=${pageLast}`)
    ])
        .then(responses => {
            for (const response of responses) {
                if (!response.ok) {
                    throw new Error('Problem fetching movies');
                }
            }
            return Promise.all(responses.map(response => response.json()));
        })
        .then(data => {
            const moviesPage1 = data[0].results || [];
            const moviesPage2 = data[1].results || [];
            const combinedMovies = [...moviesPage1, ...moviesPage2];

            return {
                page: page,
                results: combinedMovies,
                total_results: 4000,
                total_pages: 100
            };
        })
        .catch((error) => {
            throw error;
        });
};

export const getMovieRecommendations = (id,page) => {
    const pageLast = page * 2;
    const pageFirst = pageLast - 1;

    return Promise.all([
        fetch(`https://api.themoviedb.org/3/movie/${id}/recommendations?api_key=${process.env.REACT_APP_TMDB_KEY}&language=en-US&include_adult=false&include_video=false&page=${pageFirst}`),
        fetch(`https://api.themoviedb.org/3/movie/${id}/recommendations?api_key=${process.env.REACT_APP_TMDB_KEY}&language=en-US&include_adult=false&include_video=false&page=${pageLast}`)
    ])
        .then(responses => {
            for (const response of responses) {
                if (!response.ok) {
                    throw new Error('Problem fetching movies');
                }
            }
            return Promise.all(responses.map(response => response.json()));
        })
        .then(data => {
            const moviesPage1 = data[0].results || [];
            const moviesPage2 = data[1].results || [];
            const combinedMovies = [...moviesPage1, ...moviesPage2];

            return {
                page: page,
                results: combinedMovies,
                total_results: data[0].total_results,
                total_pages: Math.ceil(data[0].total_results/40)
            };
        })
        .catch((error) => {
            throw error;
        });
};

export const getGenres = async () => {
    try {
        const response = await fetch(
            `https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.REACT_APP_TMDB_KEY}&language=en-US`
        );

        if (!response.ok) {
            throw new Error(response.json().message);
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};

export const getMovie = (id) => {
    return fetch(
        `https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.REACT_APP_TMDB_KEY}`
    ).then((response) => {
        if (!response.ok) {
            throw new Error(response.json().message);
        }
        return response.json();
    })
        .catch((error) => {
            throw error
        });
};

export const getMovieImages = (id) => {
    return fetch(
        `https://api.themoviedb.org/3/movie/${id}/images?api_key=${process.env.REACT_APP_TMDB_KEY}`
    ).then((response) => {
        if (!response.ok) {
            throw new Error(response.json().message);
        }
        return response.json();

    })
        .catch((error) => {
            throw error
        });
};


export const getMovieVideos = (id) => {
    return fetch(
        `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${process.env.REACT_APP_TMDB_KEY}`
    ).then((response) => {
        if (!response.ok) {
            throw new Error(response.json().message);
        }
        return response.json();

    })
        .catch((error) => {
            throw error
        });
};

export const getMovieCredits = (id) => {
    return fetch(
        `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${process.env.REACT_APP_TMDB_KEY}`
    ).then((response) => {
        if (!response.ok) {
            throw new Error(response.json().message);
        }
        return response.json();

    })
        .catch((error) => {
            throw error
        });
};

export const getMovieReviews = (id) => {
    return fetch(
        `https://api.themoviedb.org/3/movie/${id}/reviews?api_key=${process.env.REACT_APP_TMDB_KEY}`
    ).then((response) => {
        if (!response.ok) {
            throw new Error(response.json().message);
        }
        return response.json();

    }).catch((error) => {
        throw error
    });
};

