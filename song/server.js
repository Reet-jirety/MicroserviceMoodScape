const express = require('express');
const dotenv = require('dotenv');
const SpotifyWebApi = require('spotify-web-api-node');
const cors = require('cors');

dotenv.config();

const app = express();
const port = process.env.PORT || 8888;

// Enable CORS for all routes
app.use(cors());

// Initialize Spotify API client
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: 'http://localhost:8888/callback', // Ensure this matches your Spotify app settings
});

// Middleware to parse JSON bodies
app.use(express.json());

// Endpoint to initiate Spotify authorization
app.get('/login', (req, res) => {
  const scopes = [
    'streaming',
    'user-read-email',
    'user-read-private',
    'user-read-playback-state',
    'user-modify-playback-state',
  ];
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
  console.log(authorizeURL);
  
  res.redirect(authorizeURL);
});

// Callback endpoint for Spotify authentication
app.get('/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const { access_token, refresh_token, expires_in } = data.body;

    // Set the access token on the API object to use it in later calls
    spotifyApi.setAccessToken(access_token);
    spotifyApi.setRefreshToken(refresh_token);

    // Redirect to frontend with tokens
    res.redirect(`http://localhost:3000?access_token=${access_token}&refresh_token=${refresh_token}&expires_in=${expires_in}`);
  } catch (error) {
    console.error('Error during authentication:', error);
    res.status(500).send('Authentication failed');
  }
});

// Endpoint to refresh access token
app.get('/refresh_token', async (req, res) => {
  const { refresh_token } = req.query;
  try {
    spotifyApi.setRefreshToken(refresh_token);
    const data = await spotifyApi.refreshAccessToken();
    const { access_token, expires_in } = data.body;
    res.json({ access_token, expires_in });
  } catch (error) {
    console.error('Error refreshing access token:', error);
    res.status(500).send('Could not refresh access token');
  }
});

// Search endpoint: Search for tracks using the Spotify API
app.get('/search', async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter q is required' });
  }

  try {
    const data = await spotifyApi.searchTracks(query, { limit: 10 });
    const tracksWithPreview = data.body.tracks.items.filter(
      (track) => track.preview_url
    );
    res.json({ tracks: tracksWithPreview });
  } catch (error) {
    console.error('Search failed:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
