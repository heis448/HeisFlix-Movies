import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";

const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY; // Your TMDb API Key in .env
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

const PUBLIC_VIDEOS = {
  "Big Buck Bunny":
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  Sintel:
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
};

// Fetch trailer for given media type & id
function fetchTrailer(media_type, id) {
  return fetch(
    `https://api.themoviedb.org/3/${media_type}/${id}/videos?api_key=${TMDB_API_KEY}&language=en-US`
  )
    .then((resp) => resp.json())
    .then((data) => {
      const trailer = data.results.find(
        (vid) =>
          vid.site === "YouTube" &&
          (vid.type === "Trailer" || vid.type === "Teaser")
      );
      return trailer ? `https://www.youtube.com/embed/${trailer.key}` : null;
    })
    .catch(() => null);
}

// Welcome Screen
function Welcome() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        position: "relative",
        height: "100vh",
        color: "white",
        background:
          "linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url(https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1950&q=80) center/cover no-repeat",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: "20px",
        overflow: "hidden"
      }}
    >
      <h1
        style={{
          fontSize: "3rem",
          marginBottom: "20px",
          textShadow: "0 0 20px #E50914"
        }}
      >
        Welcome to HeisFlix Movies
      </h1>
      <h2 style={{ fontWeight: "300", marginBottom: "40px" }}>
        The World of Entertainment.<br />
        Catch up with all your favourite shows on HeisFlix Movies.
      </h2>

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          pointerEvents: "none",
          overflow: "hidden"
        }}
      >
        {[...Array(20)].map((_, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              width: `${20 + Math.random() * 40}px`,
              height: `${20 + Math.random() * 40}px`,
              borderRadius: "50%",
              backgroundColor: `rgba(229, 9, 20, ${Math.random() * 0.2 + 0.1})`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `floatUp 10s ease-in-out infinite`,
              animationDelay: `${Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      <button
        onClick={() => navigate("/login")}
        style={buttonStyle}
        onMouseEnter={(e) => (e.target.style.backgroundColor = "#B20710")}
        onMouseLeave={(e) => (e.target.style.backgroundColor = "#E50914")}
      >
        Log In
      </button>

      <style>{`
        @keyframes floatUp {
          0% {transform: translateY(0); opacity: 1;}
          50% {opacity: 0.5;}
          100% {transform: translateY(-200px); opacity: 0;}
        }
      `}</style>
    </div>
  );
}

// Login Screen
function Login() {
  const navigate = useNavigate();

  return (
    <div style={loginContainerStyle}>
      <h2>Log In to HeisFlix Movies</h2>
      <input
        type="text"
        placeholder="Username"
        style={inputStyle}
        autoComplete="off"
      />
      <input type="password" placeholder="Password" style={inputStyle} />
      <button
        style={buttonStyle}
        onClick={() => navigate("/home")}
        // Simulated login - no backend
      >
        Log In
      </button>
      <button style={backButtonStyle} onClick={() => navigate("/")}>
        Back
      </button>
    </div>
  );
}

// Main Home page - Movies and Shows
function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [playingTrailer, setPlayingTrailer] = useState(null);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Watchlist saved in localStorage
  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem("heisflix_watchlist");
    return saved ? JSON.parse(saved) : [];
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchGenres();
    fetchTrending();
  }, []);

  useEffect(() => {
    localStorage.setItem("heisflix_watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  // Fetch genres list
  async function fetchGenres() {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`
      );
      const data = await res.json();
      setGenres(data.genres || []);
    } catch (error) {
      console.error("Error fetching genres", error);
    }
  }

  // Fetch trending content
  async function fetchTrending(page = 1) {
    try {
      const resp = await fetch(
        `https://api.themoviedb.org/3/trending/all/week?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`
      );
      const data = await resp.json();
      setResults(data.results || []);
      setCurrentPage(data.page);
      setTotalPages(data.total_pages);
      setSelectedGenre(null);
      setSearchTerm("");
    } catch (error) {
      console.error("Error fetching trending:", error);
    }
  }

  // Fetch by genre
  async function fetchMoviesByGenre(genreId, page = 1) {
    try {
      const resp = await fetch(
        `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}&page=${page}`
      );
      const data = await resp.json();
      setResults(data.results || []);
      setCurrentPage(data.page);
      setTotalPages(data.total_pages);
      setSelectedGenre(genreId);
      setSearchTerm("");
    } catch (error) {
      console.error("Error fetching by genre:", error);
    }
  }

  // Search movies/shows
  async function searchMovies(query, page = 1) {
    if (!query) return;
    try {
      const resp = await fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(
          query
        )}&page=${page}&include_adult=false`
      );
      const data = await resp.json();
      setResults(data.results || []);
      setCurrentPage(data.page);
      setTotalPages(data.total_pages);
      setSelectedGenre(null);
    } catch (error) {
      console.error("Search error:", error);
    }
  }

  async function handleMovieClick(movie) {
    let media_type = movie.media_type;
    if (!media_type) {
      media_type = movie.title ? "movie" : "tv";
    }
    const trailerUrl = await fetchTrailer(media_type, movie.id);

    let fallbackVideoUrl = null;
    if (!trailerUrl) {
      fallbackVideoUrl = PUBLIC_VIDEOS[movie.title] || null;
    }

    setPlayingTrailer({ ...movie, trailerUrl, fallbackVideoUrl, media_type });
  }

  function toggleWatchlist(movie) {
    const exists = watchlist.find((m) => m.id === movie.id);
    if (exists) {
      setWatchlist(watchlist.filter((m) => m.id !== movie.id));
    } else {
      setWatchlist([...watchlist, movie]);
    }
  }

  function pageChange(newPage) {
    if (newPage < 1 || newPage > totalPages) return;
    if (searchTerm) {
      searchMovies(searchTerm, newPage);
    } else if (selectedGenre) {
      fetchMoviesByGenre(selectedGenre, newPage);
    } else {
      fetchTrending(newPage);
    }
  }

  return (
    <div style={{ backgroundColor: "#141414", minHeight: "100vh", color: "white" }}>
      <header style={headerStyle}>
        <h1 style={{ color: "#E50914", margin: "10px 0" }}>
          HeisFlix Movies
        </h1>
        <nav style={{ margin: "10px 0" }}>
          <Link to="/home" style={navLinkStyle}>
            Movies & Shows
          </Link>{" "}
          |{" "}
          <Link to="/watchlist" style={navLinkStyle}>
            Watchlist ({watchlist.length})
          </Link>{" "}
          |{" "}
          <Link to="/sports" style={navLinkStyle}>
            Sports
          </Link>{" "}
          |{" "}
          <button onClick={() => navigate("/")} style={buttonStyle}>
            Log Out
          </button>
        </nav>
      </header>

      <main style={{ padding: "15px 20px" }}>
        {/* Search */}
        <input
          type="search"
          placeholder="Search movies, TV shows..."
          style={searchInputStyle}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") searchMovies(searchTerm);
          }}
          aria-label="Search movies or TV shows"
        />

        {/* Genres */}
        <div style={{ margin: "15px 0", overflowX: "auto", whiteSpace: "nowrap" }}>
          {genres.map((genre) => (
            <button
              key={genre.id}
              onClick={() => fetchMoviesByGenre(genre.id)}
              style={{
                marginRight: "8px",
                padding: "8px 16px",
                cursor: "pointer",
                backgroundColor:
                  selectedGenre === genre.id ? "#E50914" : "#222",
                border: "none",
                borderRadius: "4px",
                color: "white",
                whiteSpace: "nowrap"
              }}
              aria-pressed={selectedGenre === genre.id}
            >
              {genre.name}
            </button>
          ))}
          <button
            onClick={() => fetchTrending()}
            style={{
              backgroundColor: !selectedGenre ? "#E50914" : "#222",
              border: "none",
              borderRadius: "4px",
              padding: "8px 16px",
              marginLeft: "8px",
              color: "white",
              cursor: "pointer"
            }}
          >
            Trending
          </button>
        </div>

        {/* Movie Grid */}
        {results.length === 0 ? (
          <p style={{ color: "#bbb" }}>No movies or shows found.</p>
        ) : (
          <div style={gridStyle}>
            {results.map((movie) => (
              <div
                key={movie.id}
                style={cardStyle}
                onClick={() => handleMovieClick(movie)}
                title={movie.title || movie.name}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleMovieClick(movie);
                }}
              >
                <img
                  src={
                    movie.poster_path
                      ? `${IMAGE_BASE_URL}${movie.poster_path}`
                      : "https://via.placeholder.com/300x450?text=No+Image"
                  }
                  alt={movie.title || movie.name || "Movie Poster"}
                  style={imageStyle}
                />
                <div style={{ padding: "10px", flexGrow: 1 }}>
                  <strong>{movie.title || movie.name}</strong>
                  <br />
                  <small style={{ opacity: 0.7 }}>
                    {movie.media_type === "movie"
                      ? "Movie"
                      : movie.media_type === "tv"
                      ? "TV Show"
                      : ""}
                  </small>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWatchlist(movie);
                    }}
                    style={{
                      marginTop: "10px",
                      backgroundColor: watchlist.find(
                        (m) => m.id === movie.id
                      )
                        ? "#E50914"
                        : "#555",
                      color: "white",
                      border: "none",
                      padding: "6px 10px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      width: "100%"
                    }}
                    aria-pressed={watchlist.find((m) => m.id === movie.id)}
                  >
                    {watchlist.find((m) => m.id === movie.id)
                      ? "Remove from Watchlist"
                      : "Add to Watchlist"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ marginTop: "25px", textAlign: "center" }}>
            <button
              onClick={() => pageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={paginationBtnStyle}
            >
              ← Prev
            </button>
            <span style={{ margin: "0 15px" }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => pageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={paginationBtnStyle}
            >
              Next →
            </button>
          </div>
        )}
      </main>

      {/* Trailer Modal */}
      {playingTrailer && (
        <TrailerModal
          movie={playingTrailer}
          onClose={() => setPlayingTrailer(null)}
        />
      )}
    </div>
  );
}

// Watchlist Page - shows saved favorites
function Watchlist() {
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem("heisflix_watchlist");
    return saved ? JSON.parse(saved) : [];
  });
  const [playingTrailer, setPlayingTrailer] = useState(null);

  useEffect(() => {
    localStorage.setItem("heisflix_watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  function removeFromWatchlist(movieId) {
    setWatchlist(watchlist.filter((m) => m.id !== movieId));
  }

  async function handleMovieClick(movie) {
    let media_type = movie.media_type;
    if (!media_type) {
      media_type = movie.title ? "movie" : "tv";
    }
    const trailerUrl = await fetchTrailer(media_type, movie.id);

    let fallbackVideoUrl = null;
    if (!trailerUrl) {
      fallbackVideoUrl = PUBLIC_VIDEOS[movie.title] || null;
    }

    setPlayingTrailer({ ...movie, trailerUrl, fallbackVideoUrl, media_type });
  }

  return (
    <div style={{ backgroundColor: "#141414", minHeight: "100vh", color: "white" }}>
      <header style={headerStyle}>
        <h1 style={{ color: "#E50914", margin: "10px 0" }}>Your Watchlist</h1>
        <nav style={{ margin: "10px 0" }}>
          <Link to="/home" style={navLinkStyle}>
            Movies & Shows
          </Link>{" "}
          |{" "}
          <Link to="/watchlist" style={navLinkStyle}>
            Watchlist ({watchlist.length})
          </Link>{" "}
          |{" "}
          <Link to="/sports" style={navLinkStyle}>
            Sports
          </Link>{" "}
          |{" "}
          <button onClick={() => navigate("/")} style={buttonStyle}>
            Log Out
          </button>
        </nav>
      </header>

      <main style={{ padding: "15px 20px" }}>
        {watchlist.length === 0 ? (
          <p style={{ color: "#bbb" }}>Your watchlist is empty.</p>
        ) : (
          <div style={gridStyle}>
            {watchlist.map((movie) => (
              <div
                key={movie.id}
                style={cardStyle}
                onClick={() => handleMovieClick(movie)}
                title={movie.title || movie.name}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleMovieClick(movie);
                }}
              >
                <img
                  src={
                    movie.poster_path
                      ? `${IMAGE_BASE_URL}${movie.poster_path}`
                      : "https://via.placeholder.com/300x450?text=No+Image"
                  }
                  alt={movie.title || movie.name || "Movie Poster"}
                  style={imageStyle}
                />
                <div style={{ padding: "10px", flexGrow: 1 }}>
                  <strong>{movie.title || movie.name}</strong>
                  <br />
                  <small style={{ opacity: 0.7 }}>
                    {movie.media_type === "movie"
                      ? "Movie"
                      : movie.media_type === "tv"
                      ? "TV Show"
                      : ""}
                  </small>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromWatchlist(movie.id);
                    }}
                    style={{
                      marginTop: "10px",
                      backgroundColor: "#E50914",
                      color: "white",
                      border: "none",
                      padding: "6px 10px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      width: "100%"
                    }}
                  >
                    Remove from Watchlist
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {playingTrailer && (
        <TrailerModal
          movie={playingTrailer}
          onClose={() => setPlayingTrailer(null)}
        />
      )}
    </div>
  );
}

// Trailer modal popup
function TrailerModal({ movie, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.9)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 200,
        padding: "20px"
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="trailer-title"
    >
      <div
        style={{
          maxWidth: "900px",
          width: "100%",
          position: "relative",
          background: "#222",
          borderRadius: "8px",
          padding: "20px"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} style={closeBtnStyle} aria-label="Close trailer modal">
          ✕
        </button>
        <h2 id="trailer-title" style={{ color: "white", marginBottom: "10px" }}>
          {movie.title || movie.name}
        </h2>
        {movie.trailerUrl ? (
          <iframe
            width="100%"
            height="450"
            src={movie.trailerUrl + "?autoplay=1"}
            allow="autoplay; encrypted-media"
            allowFullScreen
            title="Trailer"
            style={{ borderRadius: "8px" }}
          />
        ) : movie.fallbackVideoUrl ? (
          <video
            width="100%"
            height="450"
            controls
            autoPlay
            style={{ borderRadius: "8px" }}
          >
            <source src={movie.fallbackVideoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <p style={{ color: "white" }}>Trailer or video not available.</p>
        )}
        <p style={{ color: "white", marginTop: "10px" }}>{movie.overview}</p>
      </div>
    </div>
  );
}

// Sports highlights page
function Sports() {
  const [sportsNews, setSportsNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSportsNews();
  }, []);

  async function fetchSportsNews() {
    setLoading(true);
    try {
      // ScoreBat free highlights API
      const response = await fetch(
        "https://www.scorebat.com/video-api/v3/feed/?token=demo"
      );
      const data = await response.json();
      setSportsNews(data.response || []);
      setLoading(false);
    } catch (error) {
      console.error("Error loading sports news:", error);
      setSportsNews([]);
      setLoading(false);
    }
  }

  return (
    <div style={{ backgroundColor: "#141414", minHeight: "100vh", color: "white" }}>
      <header style={headerStyle}>
        <h1 style={{ color: "#E50914", margin: "10px 0" }}>HeisFlix Sports</h1>
        <nav style={{ margin: "10px 0" }}>
          <Link to="/home" style={navLinkStyle}>
            Movies & Shows
          </Link>{" "}
          |{" "}
          <Link to="/watchlist" style={navLinkStyle}>
            Watchlist
          </Link>{" "}
          |{" "}
          <Link to="/sports" style={navLinkStyle}>
            Sports
          </Link>{" "}
          |{" "}
          <button onClick={() => navigate("/")} style={buttonStyle}>
            Log Out
          </button>
        </nav>
      </header>

      <main style={{ padding: "20px" }}>
        {loading ? (
          <p>Loading sports highlights...</p>
        ) : sportsNews.length === 0 ? (
          <p>No sports news available at this time.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))",
              gap: "20px",
            }}
          >
            {sportsNews.map((item, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: "#222",
                  padding: "15px",
                  borderRadius: "8px",
                  boxShadow: "0 0 10px rgba(229,9,20,0.6)",
                }}
              >
                <h3>{item.title}</h3>
                {item.competition && (
                  <p style={{ fontStyle: "italic" }}>
                    Competition: {item.competition.name}
                  </p>
                )}
                {item.videos && item.videos.length > 0 && (
                  <div style={{ marginTop: "10px" }}>
                    {item.videos.map((video, i) => (
                      <div key={i} style={{ marginBottom: "10px" }}>
                        <strong>{video.title}</strong>
                        <div
                          style={{
                            position: "relative",
                            paddingBottom: "56.25%",
                            paddingTop: 0,
                            height: 0,
                            overflow: "hidden",
                            borderRadius: "8px",
                          }}
                        >
                          <iframe
                            src={video.embed}
                            title={video.title}
                            frameBorder="0"
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                            }}
                          ></iframe>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <a
                  href={item.matchviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#E50914",
                    textDecoration: "underline",
                    display: "inline-block",
                    marginTop: "10px",
                    cursor: "pointer",
                  }}
                >
                  Watch Full Highlights &gt;
                </a>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// Main App routing
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/sports" element={<Sports />} />
      </Routes>
    </Router>
  );
}

// Styles
const buttonStyle = {
  padding: "15px 50px",
  fontSize: "1.4rem",
  fontWeight: "bold",
  backgroundColor: "#E50914",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  zIndex: 10,
  boxShadow: "0 0 20px #E50914",
  transition: "background-color 0.3s"
};

const inputStyle = {
  padding: "12px",
  width: "300px",
  maxWidth: "100%",
  marginBottom: "15px",
  fontSize: "1rem",
  borderRadius: "4px",
  border: "none",
  boxShadow: "0 0 5px rgba(229, 9, 20, 0.8)",
  backgroundColor: "#222",
  color: "white"
};

const backButtonStyle = {
  marginTop: "15px",
  backgroundColor: "#444",
  width: "120px",
  borderRadius: "4px",
  border: "none",
  color: "white",
  cursor: "pointer",
  transition: "background-color 0.3s"
};

const loginContainerStyle = {
  backgroundColor: "#141414",
  color: "white",
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
  padding: "20px"
};

const headerStyle = {
  padding: "10px 20px",
  borderBottom: "1px solid #333",
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "#141414",
  position: "sticky",
  top: 0,
  zIndex: 100
};

const navLinkStyle = {
  color: "#E50914",
  textDecoration: "none",
  fontWeight: "bold",
  margin: "0 8px"
};

const searchInputStyle = {
  width: "100%",
  maxWidth: "600px",
  padding: "12px",
  fontSize: "1rem",
  marginBottom: "20px",
  borderRadius: "4px",
  border: "none",
  boxShadow: "0 0 5px rgba(229, 9, 20, 0.8)",
  backgroundColor: "#222",
  color: "white"
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))",
  gap: "20px"
};

const cardStyle = {
  cursor: "pointer",
  borderRadius: "8px",
  overflow: "hidden",
  backgroundColor: "#222",
  boxShadow: "0 0 15px rgba(229,9,20,0.6)",
  color: "white",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  minHeight: "320px",
  transition: "transform 0.3s"
};

const imageStyle = {
  width: "100%",
  height: "240px",
  objectFit: "cover",
  borderTopLeftRadius: "8px",
  borderTopRightRadius: "8px",
  flexShrink: 0
};

const closeBtnStyle = {
  position: "absolute",
  top: "10px",
  right: "10px",
  background: "#E50914",
  border: "none",
  borderRadius: "50%",
  width: "35px",
  height: "35px",
  color: "white",
  fontWeight: "bold",
  fontSize: "1.1rem",
  cursor: "pointer",
  lineHeight: 1
};

const paginationBtnStyle = {
  backgroundColor: "#E50914",
  border: "none",
  borderRadius: "4px",
  padding: "8px 15px",
  color: "white",
  cursor: "pointer",
  margin: "0 5px",
  fontWeight: "bold"
};
