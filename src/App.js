import { useEffect, useRef, useState } from 'react';
import StarRating from './starrating.js';
import { useMovies } from './useMovies.js';
import { useLocalStorageState } from './useLocalStorageState.js';
import { useKey } from './useKey.js';


const average = (arr) =>
    arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = 'f84fc31d';

export default function App() {
    const [query, setQuery] = useState('');
    const [selectedId, setSelectedId] = useState(null);

    const {movies, isLoading, error } = useMovies(query)
    const [watched, setWatched] = useLocalStorageState([], 'wached')

 function handleSelectMovie(id) {
        setSelectedId((selectedId) => (selectedId === id ? null : id));
    }

    function CloseSelectedMovie() {
        setSelectedId(null);
    }

    function handleAddWatchedMovie(movie) {
        setWatched((watched) => [...watched, movie]);

        // localStorage.setItem('watched', JSON.stringify([...watched, movie]));
    }

    function handleRemoveWatchedMovie(id) {
        setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
    }

    return (
        <>
            <NavBar>
                <Search query={query} setQuery={setQuery} />
                <NumResults movies={movies} />
            </NavBar>

            <Main>
                <Box>
                    {isLoading && <Loader />}
                    {!isLoading && !error && (
                        <MovieList
                            movies={movies}
                            onSelectMovie={handleSelectMovie}
                        />
                    )}
                    {error && <ErrorMessage message={error} />}
                </Box>

                <Box>
                    <>
                        {selectedId ? (
                            <MovieDetails
                                selectedId={selectedId}
                                onCloseMovie={CloseSelectedMovie}
                                onAddWatchedMovie={handleAddWatchedMovie}
                                watched={watched}
                            />
                        ) : (
                            <>
                                <WachedSummery watched={watched} />
                                <WachedMoviesList
                                    watched={watched}
                                    onRemoveMovie={handleRemoveWatchedMovie}
                                />
                            </>
                        )}
                    </>
                </Box>
            </Main>
        </>
    );
}

function MovieDetails({
    selectedId,
    onCloseMovie,
    onAddWatchedMovie,
    watched,
}) {
    const [movie, setMovie] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [userRating, setUserRating] = useState('');
    const {
        Title: title,
        Year: year,
        Poster: poster,
        Runtime: runtime,
        imdbRating,
        Plot: plot,
        Released: released,
        Actors: actors,
        Director: director,
        Genre: genre,
    } = movie;

    const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);

    useKey('Escape', onCloseMovie)

    function handleAdd() {
        const newWachedMovie = {
            imdbID: selectedId,
            title,
            year,
            poster,
            imdbRating: Number(imdbRating),
            runtime: Number(runtime.split(' ').at(0)),
            userRating,
        };

        onAddWatchedMovie(newWachedMovie);
        onCloseMovie();
    }

    useEffect(
        function () {
            async function getMovieDetails() {
                try {
                    setIsLoading(true);
                    setError('');
                    const res = await fetch(
                        `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
                    );

                    if (!res.ok) throw new Error('oh oh');

                    const data = await res.json();

                    if (data.Response === 'False')
                        throw new Error('Movie not found');
                    setMovie(data);
                } catch (e) {
                    setError(e.message);
                } finally {
                    setIsLoading(false);
                }
            }
            getMovieDetails();
        },
        [selectedId]
    );

    useEffect(
        function () {
            if (!title) return;
            document.title = `${title}`;

            return function cleanup() {
                document.title = 'Fuckin awsome App';
            };
        },
        [title]
    );

    return (
        <div className="details">
            {isLoading && <Loader />}
            {!isLoading && !error && (
                <>
                    <header>
                        <button className="btn-back" onClick={onCloseMovie}>
                            &larr;
                        </button>
                        <img src={poster} alt={`Poster of ${movie}`} />
                        <div className="details-overview">
                            <h3>{title}</h3>
                            <p>
                                {released} &bull; {runtime}
                            </p>
                            <p>{genre}</p>
                            <p>
                                <span>⭐️</span>
                                {imdbRating} IMDb Rating
                            </p>
                        </div>
                    </header>
                    <section>
                        <div className="rating">
                            {!isWatched ? (
                                <>
                                    <StarRating onSetRating={setUserRating} />

                                    {userRating > 0 && (
                                        <button
                                            className="btn-add"
                                            onClick={handleAdd}
                                        >
                                            + Add to list
                                        </button>
                                    )}
                                </>
                            ) : (
                                <p>alrady on your list</p>
                            )}
                        </div>
                        <p>
                            <em>{plot}</em>
                        </p>
                        <p>Starring {actors}</p>
                        <p>Directed by {director}</p>
                    </section>
                </>
            )}
            {error && <ErrorMessage message={error} />}
        </div>
    );
}

function Loader() {
    return (
        <div>
            <p className="loader">Loading...</p>
        </div>
    );
}

function ErrorMessage({ message }) {
    return <p className="error">{message}</p>;
}

function NavBar({ children }) {
    return (
        <nav className="nav-bar">
            <Logo />
            {children}
        </nav>
    );
}

function Logo() {
    return (
        <div className="logo">
            <span role="img">🍿</span>
            <h1>usePopcorn</h1>
        </div>
    );
}

function Search({ query, setQuery }) {
    const inputEl = useRef(null);

    useKey('Enter', function () {
        if (document.activeElement === inputEl.current) return;
        inputEl.current.focus();
                    setQuery('');
    })

    return (
        <input
            className="search"
            type="text"
            placeholder="Search movies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            ref={inputEl}
        />
    );
}

function NumResults({ movies }) {
    return (
        <p className="num-results">
            Found <strong>{movies.length}</strong> results
        </p>
    );
}

function Main({ children }) {
    return <main className="main">{children}</main>;
}

function Box({ children }) {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <div className="box">
            <button
                className="btn-toggle"
                onClick={() => setIsOpen((open) => !open)}
            >
                {isOpen ? '–' : '+'}
            </button>
            {isOpen && children}
        </div>
    );
}

function MovieList({ movies, onSelectMovie }) {
    return (
        <ul className="list list-movies">
            {movies?.map((movie) => (
                <Movie
                    movie={movie}
                    key={movie.imdbID}
                    onSelectMovie={onSelectMovie}
                />
            ))}
        </ul>
    );
}

function Movie({ movie, onSelectMovie }) {
    return (
        <li onClick={() => onSelectMovie(movie.imdbID)}>
            <img src={movie.Poster} alt={`${movie.Title} poster`} />
            <h3>{movie.Title}</h3>
            <div>
                <p>
                    <span>🗓</span>
                    <span>{movie.Year}</span>
                </p>
            </div>
        </li>
    );
}

function WachedSummery({ watched }) {
    const avgImdbRating = average(
        watched.map((movie) => movie.imdbRating)
    ).toFixed(1);
    const avgUserRating = average(
        watched.map((movie) => movie.userRating)
    ).toFixed(1);
    const avgRuntime = average(watched.map((movie) => movie.runtime)).toFixed(
        1
    );

    return (
        <div className="summary">
            <h2>Movies you watched</h2>
            <div>
                <p>
                    <span>#️⃣</span>
                    <span>{watched.length} movies</span>
                </p>
                <p>
                    <span>⭐️</span>
                    <span>{avgImdbRating}</span>
                </p>
                <p>
                    <span>🌟</span>
                    <span>{avgUserRating}</span>
                </p>
                <p>
                    <span>⏳</span>
                    <span>{avgRuntime} min</span>
                </p>
            </div>
        </div>
    );
}

function WachedMoviesList({ watched, onRemoveMovie }) {
    return (
        <ul className="list">
            {watched.map((movie) => (
                <WachedMovie
                    onRemoveMovie={onRemoveMovie}
                    movie={movie}
                    key={movie.imdbID}
                />
            ))}
        </ul>
    );
}

function WachedMovie({ movie, onRemoveMovie }) {
    return (
        <li>
            <img src={movie.poster} alt={`${movie.title} poster`} />
            <h3>{movie.title}</h3>
            <button
                onClick={() => onRemoveMovie(movie.imdbID)}
                className="btn-delete"
            >
                X
            </button>
            <div>
                <p>
                    <span>⭐️</span>
                    <span>{movie.imdbRating}</span>
                </p>
                <p>
                    <span>🌟</span>
                    <span>{movie.userRating}</span>
                </p>
                <p>
                    <span>⏳</span>
                    <span>{movie.runtime} min</span>
                </p>
            </div>
        </li>
    );
}
