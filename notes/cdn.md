# CDN: what I want to learn

1. A CDN caches static data close to the user, on edge servers, to cut response time.
2. Caching is mainly for GET requests.
3. A CDN is a first line of defence against DDoS and other attacks.
4. The client's request goes to the closest CDN edge.
5. Cache hit: served from the edge. Cache miss: the edge fetches from the origin, caches the response and sends it to the client.
6. POST requests are passed to the origin.
7. The edge keeps a pool of connections to the origin, to avoid TCP and TLS setup overhead.
8. Go deeper: how connection pools work here.
9. Go deeper: how the edge multiplexes many client requests onto few origin connections.
10. Go deeper: how the private backbone network between CDN and origin fits in.

Sources: `cdn-sources.md`. Lab plan: `cdn-lab-plan.md`.
