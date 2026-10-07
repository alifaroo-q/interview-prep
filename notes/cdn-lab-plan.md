# CDN explainer: lab plan

Real labs use the `cdn` tool (lab server) : a shell in `xp-cdn-client` next to `cdn-edge` (nginx proxy_cache) and `cdn-origin` (nginx, TLS), with toxiproxy between edge and origin (80 ms round trip; 1 s on the slow port). Setup: `cdn-setup`.

| # | Chapter | Mechanism | Hidden state | Tier | Break it |
|---|---|---|---|---|---|
| 1 | What a CDN is | each round trip costs one RTT; a page needs several | round trips on a timeline | 3 | far origin, new connection, cache miss |
| 2 | Reaching the nearest edge | anycast (BGP) and DNS steering | route table per user, chosen PoP | 3 | withdraw a PoP; far resolver with DNS steering |
| 3 | Hit and miss | lookup by key, fetch on miss, store | per-edge cache table; real: X-Cache, cache files with KEY | 3 + 2 | TTL expiry; other edge has no copy |
| 4 | What may be cached | method + Cache-Control rules | decision trace; real: X-Cache absent for POST, origin conn header | 3 + 2 | "cache everything" serves ana's page to bo |
| 5 | Cache key and Vary | key = host + path + query (+ Vary headers) | key strings in cache files | 2 | missing Vary: wrong language; random query = new key |
| 6 | Freshness and stale | age vs max-age, ETag revalidation, stale-if-error | entry state over time; real: EXPIRED / REVALIDATED / STALE | 3 + 2 | origin down: stale served; changed file still old until expiry |
| 7 | Coalescing and tiered cache | one fetch per key, waiting queue; shield | waiting queue, origin request count | 3 + 2 | lock off: 20 origin requests; non-cacheable response: all queued go to origin |
| 8 | Cost of a new connection | TCP + TLS handshakes, slow start | packets per round trip, cwnd | 3 | TLS 1.2 far away; 0-RTT replay of a POST |
| 9 | Connection pools | idle cache of warm connections | pool slots idle/busy; real: X-Origin-Conn, X-Edge-Connect, stub_status accepts vs requests | 3 + 2 | origin idle timeout shorter than the edge's: reuse of closed connection; keepalive 0 |
| 10 | Multiplexing | HTTP/1.1 one request per connection at a time, HTTP/2 streams, HTTP/3 per-stream loss | streams per connection; real: curl num_connects, edge vs origin accepts | 3 + 2 | packet loss stalls all HTTP/2 streams; nginx HTTP/2 upstream does not multiplex |
| 11 | Backbone | private paths, warm long-haul connections, congestion avoidance | path, RTT, loss, throughput | 3 | congested public link |
| 12 | DDoS | anycast spreading, SYN cookies, rate limit, cache, origin lock-down | load meters per layer; real: 429 count, MISS count | 3 + 2 | cache-busting query strings; origin IP exposed |
