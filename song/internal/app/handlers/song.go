package handlers

import (
    "net/http"

    "github.com/gin-gonic/gin"
    "microservicemoodscape/song/internal/app/services"
)

type SongHandler struct {
    service *services.SongService
}

func NewSongHandler() *SongHandler {
    return &SongHandler{service: services.NewSongService()}
}

func (h *SongHandler) SearchSongs(c *gin.Context) {
    query := c.Query("query")
    songs, err := h.service.SearchSongs(query)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, songs)
}

func (h *SongHandler) SearchAlbums(c *gin.Context) {
    query := c.Query("query")
    albums, err := h.service.SearchAlbums(query)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, albums)
}

func (h *SongHandler) SearchArtists(c *gin.Context) {
    query := c.Query("query")
    artists, err := h.service.SearchArtists(query)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, artists)
}

func (h *SongHandler) GeneralSearch(c *gin.Context) {
    query := c.Query("query")
    results, err := h.service.GeneralSearch(query)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, results)
}
