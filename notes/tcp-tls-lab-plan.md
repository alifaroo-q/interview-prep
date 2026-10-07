# TCP, TLS, HTTP/2 and QUIC explainer: lab plan

Real labs use the `net` tool (lab server): a shell in `xp-net` (alpine: curl, openssl, tcpdump, ss, tc). `net-setup [rtt] [loss]` sets a tc netem delay and loss on the client's own interface. It talks to `cdn-origin` (alias `origin.acmeshop.com`, TLS 1.3 on 443, 0-RTT on 8443) and `cdn-edge`. HTTPS DNS records and Alt-Svc use the `dig` and `curl` tools against real hosts.

The CDN explainer already has real labs for pools, fan-in, coalescing and the backbone. This explainer goes one layer down (packets, handshake messages, frames) and links there.

| # | Chapter | Mechanism | Hidden state | Tier | Break it |
|---|---|---|---|---|---|
| 1 | Two connections | the edge ends the client's connection and opens its own | per-leg table: addresses, protocol, who can read the request; real: client port and HTTP/2 vs origin's peer and HTTP/1.1 | 3 + 2 | origin leg in plain HTTP: request readable on the path |
| 2 | TCP handshake | SYN, SYN-ACK, ACK; ISN; states | per-side state and seq/ack numbers; real: tcpdump flags and seq, ss SYN-SENT timer and retrans | 3 + 2 | lost SYN: 1 s timeout and resend; closed port: refused |
| 3 | TLS 1.3 handshake | key share in first flight, server proves identity, both derive keys | which keys each side holds, which messages a watcher can read; real: openssl -msg message list, group, cipher | 3 + 2 | HelloRetryRequest (+1 RTT), TLS 1.2 only client (alert 70), wrong name |
| 4 | Resumption and 0-RTT | ticket, PSK, early data | client ticket store, server replay record; real: Reused, no Certificate, early data: 1 | 3 + 2 | replayed 0-RTT POST runs twice |
| 5 | Keep-alive and TIME-WAIT | reuse vs close per request; closer holds TIME-WAIT | per-request handshake count, TIME-WAIT ports; real: num_connects, conn number, ss time-wait with timer | 3 + 2 | 50 separate runs leave 49 sockets in TIME-WAIT |
| 6 | Pools and concentration | in flight = rate x time (Little's law); per protocol connections | client conns vs origin conns, in flight | 3 (real pool lab in CDN ch 9) | origin slows: in-flight and connections jump |
| 7 | HTTP/1.1 head-of-line blocking | one response at a time per connection, pipelining in order | per-connection queue and waterfall | 3 | slow first response blocks the rest |
| 8 | HTTP/2 frames and streams | 9-byte frame header, odd stream IDs, interleaving, max streams, RST_STREAM | frames on the wire, per-stream reassembly; real: curl stream IDs 1, 3, 5 on one connection vs 3 HTTP/1.1 connections | 3 + 2 | max streams 1; RST_STREAM cancels one stream only |
| 9 | TCP head-of-line blocking | in-order delivery holds later bytes | receive buffer, next expected byte, per-stream delivered; real: nstat TcpRetransSegs with netem loss | 3 + 2 | one lost segment stalls all streams |
| 10 | QUIC and HTTP/3 | combined handshake on UDP, streams in transport | setup flights per protocol; real: HTTPS record alpn and Alt-Svc of a real site | 3 + 2 (real hosts) | UDP blocked: fall back to TCP |
| 11 | Connection migration | lookup by 4-tuple vs connection ID, path validation | server lookup tables | 3 | load balancer that hashes on the 4-tuple |
| 12 | Anycast, BGP and PoPs | many PoPs announce one prefix; BGP picks by policy then AS path | ISP route table, chosen PoP | 3 | local preference sends Karachi to a far PoP; route change mid-connection resets TCP |
| 13 | Tiers, backbone and split connections | each leg has its own RTT, loss and warm pool | per-leg handshakes and Mathis throughput | 3 (real backbone labs in CDN ch 7, 11) | lossy public path |
| 14 | One request end to end | cold first request, cached second, POST | hop by hop: connection, protocol, round trips | 3 | cold edge-to-origin pool |
