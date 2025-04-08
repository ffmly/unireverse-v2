self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("sports-app-v1").then((cache) => {
      return cache.addAll([
        "/",
        "/images/football.png",
        "/images/basketball.png",
        "/images/handball.png",
        "/images/connection-success.png",
        "/api/ping",
      ])
    }),
  )
})

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).catch(() => {
          // Return a fallback for navigation requests
          if (event.request.mode === "navigate") {
            return caches.match("/")
          }
          return null
        })
      )
    }),
  )
})
