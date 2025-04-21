import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '@/lib/axios'; // Assuming axios setup is in lib/axios.js
import './Album.css'; // We'll create this next

const Album = () => {
  const { albumId } = useParams();
  const [albumDetails, setAlbumDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAlbumDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        // TODO: Replace with the actual API endpoint for fetching album details
        // Example: const response = await axios.get(`/api/albums/${albumId}`);
        // For now, using placeholder data
        console.log(`Fetching details for album ID: ${albumId}`);
        // Simulating API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockData = {
          id: albumId,
          title: `Album Title ${albumId}`,
          artist: 'Artist Name',
          releaseDate: '2024-01-01',
          coverArtUrl: 'https://via.placeholder.com/300', // Placeholder image
          tracks: [
            { id: 1, title: 'Track 1', duration: '3:45' },
            { id: 2, title: 'Track 2', duration: '4:15' },
            { id: 3, title: 'Track 3', duration: '2:55' },
            // Add more tracks as needed
          ],
        };
        setAlbumDetails(mockData);
      } catch (err) {
        console.error("Error fetching album details:", err);
        setError('Failed to load album details.');
      } finally {
        setLoading(false);
      }
    };

    if (albumId) {
      fetchAlbumDetails();
    }
  }, [albumId]);

  if (loading) {
    return <div className="album-loading">Loading album details...</div>;
  }

  if (error) {
    return <div className="album-error">Error: {error}</div>;
  }

  if (!albumDetails) {
    return <div className="album-not-found">Album not found.</div>;
  }

  return (
    <div className="album-page">
      <div className="album-header">
        <img src={albumDetails.coverArtUrl} alt={`${albumDetails.title} cover art`} className="album-cover-art" />
        <div className="album-info">
          <h1>{albumDetails.title}</h1>
          <h2>{albumDetails.artist}</h2>
          <p>Released: {albumDetails.releaseDate}</p>
          <p>{albumDetails.tracks.length} tracks</p>
          {/* Add other details like total duration, genre etc. if available */}
        </div>
      </div>

      <div className="album-tracklist">
        <h3>Tracklist</h3>
        <ol>
          {albumDetails.tracks.map((track, index) => (
            <li key={track.id} className="track-item">
              <span className="track-number">{index + 1}.</span>
              <span className="track-title">{track.title}</span>
              <span className="track-duration">{track.duration}</span>
              {/* Add play button or other actions here */}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default Album;
