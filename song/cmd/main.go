package main

import (
    "log"

    "github.com/gin-gonic/gin"
    "microservicemoodscape/song/internal/app/handlers"
)

func main() {
    router := gin.Default()
    handler := handlers.NewSongHandler()

    router.GET("/songs/search", handler.SearchSongs)
    router.GET("/albums/search", handler.SearchAlbums)
    router.GET("/artists/search", handler.SearchArtists)
    router.GET("/search", handler.GeneralSearch)

    log.Fatal(router.Run(":8010"))
}
