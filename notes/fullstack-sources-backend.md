# Full stack interview: backend source facts

Checked 2026-10-07. "Fetched" = page text read. "Fetched (summarizer)" = read through a fetch tool that returned the quote, not the raw page. "Snippet" = search result only.

## 1. Databases for app developers

- Default isolation is Read Committed. Fetched. https://www.postgresql.org/docs/current/transaction-iso.html. "Read Committed is the default isolation level in PostgreSQL."
- Read Committed SELECT sees a snapshot taken at query start. Fetched. Same URL. "a SELECT query (without a FOR UPDATE/SHARE clause) sees only data committed before the query began"
- SELECT ... FOR UPDATE locks rows. Fetched. https://www.postgresql.org/docs/current/explicit-locking.html. "FOR UPDATE causes the rows retrieved by the SELECT statement to be locked as though for update. This prevents them from being locked, modified or deleted by other transactions until the current transaction ends."
- Other writers wait. Fetched. Same URL. "other transactions that attempt UPDATE, DELETE, SELECT FOR UPDATE, SELECT FOR NO KEY UPDATE, SELECT FOR SHARE or SELECT FOR KEY SHARE of these rows will be blocked until the current transaction ends"
- NOWAIT / SKIP LOCKED. Fetched. https://www.postgresql.org/docs/current/sql-select.html. "To prevent the operation from waiting for other transactions to commit, use either the NOWAIT or SKIP LOCKED option."
- OFFSET cost. Fetched. https://www.postgresql.org/docs/current/queries-limit.html. "The rows skipped by an OFFSET clause still have to be computed inside the server; therefore a large OFFSET might be inefficient."
- Keyset pagination: the PostgreSQL page does NOT name keyset. NOT CONFIRMED in PG docs (the OFFSET quote above is the only primary fact).
- N+1 (Rails guide). Fetched. https://guides.rubyonrails.org/active_record_querying.html (section 16.1). "The above code executes 1 (to find 10 books) + 10 (one per each book to load the author) = 11 queries in total."
- Rails fix. Fetched. Same URL (16.1.1). "Active Record lets you specify in advance all the associations that are going to be loaded."
- Django prefetch_related. Fetched. https://docs.djangoproject.com/en/stable/ref/models/querysets/. "Returns a QuerySet that will automatically retrieve the given lookups, each in one extra batch query."

## 2. Caching

- Cache-aside (called lazy loading). Fetched. https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/Strategies.html (this copy is the Memcached strategies page). "lazy loading is a caching strategy that loads data into the cache only when necessary."
- Miss flow. Fetched. Same URL. "If the data doesn't exist in the cache or has expired, your application requests the data from your data store. ... Your application next writes the data received from the store to the cache."
- SET NX. Fetched. https://redis.io/docs/latest/commands/set/. "NX Only set the key if it does not already exist."
- SET EX syntax. Fetched. Same URL. Syntax line: "EX seconds | PX milliseconds | EXAT unix-time-seconds | PXAT unix-time-milliseconds | KEEPTTL"
- EXPIRE. Fetched. https://redis.io/docs/latest/commands/expire/. "Set a timeout on key. After the timeout has expired, the key will automatically be deleted."
- INCR. Fetched. https://redis.io/docs/latest/commands/incr/. "Increments the number stored at key by one. If the key does not exist, it is set to 0 before performing the operation."
- Facebook outage, 23 Sep 2010 (Robert Johnson). Fetched via Wayback copy (the engineering.fb.com URL I tried returns 404; original note: https://www.facebook.com/note.php?note_id=431441338919, archived at https://web.archive.org/web/2010/https://www.facebook.com/note.php?note_id=431441338919). "every single client saw the invalid value and attempted to fix it. Because the fix involves making a query to a cluster of databases, that cluster was quickly overwhelmed by hundreds of thousands of queries a second."
- Same, the loop. Fetched (same). "every time a client got an error attempting to query one of the databases it interpreted it as an invalid value, and deleted the corresponding cache key. ... We had entered a feedback loop that didn't allow the databases to recover."
- Same, recovery. Fetched (same). "we had to stop all traffic to this database cluster, which meant turning off the site."
- Memcache leases. Fetched. "Scaling Memcache at Facebook", NSDI 2013, https://www.usenix.org/system/files/conference/nsdi13/nsdi13-final170_update.pdf. "A thundering herd happens when a specific key undergoes heavy read and write activity. As the write activity repeatedly invalidates the recently set values, many reads default to the more costly path."
- Lease throttle number. Fetched. Same PDF. "By default, we configure these servers to return a token only once every 10 seconds per key."

## 3. Rate limiting and scaling

- Redis rate limiter pattern. Fetched. https://redis.io/docs/latest/commands/incr/. "The rate limiter pattern is a special counter that is used to limit the rate at which an operation can be performed." Example caps at "ten requests per second per IP address"; code uses MULTI, INCR, EXPIRE.
- Stripe token bucket. Fetched (summarizer). https://stripe.com/blog/rate-limiters. "We use the token bucket algorithm to do rate limiting. This algorithm has a centralized bucket host where you take tokens on each request, and slowly drip more tokens into the bucket."
- Stripe limiter kinds. Fetched (summarizer). Same URL. Request rate limiter, concurrent requests limiter, fleet usage load shedder, worker utilization load shedder. "If a box is too busy to handle its request volume, it will slowly start shedding less-critical requests."
- RFC 6585 429. Fetched. https://www.rfc-editor.org/rfc/rfc6585 (sec 4). "The 429 status code indicates that the user has sent too many requests in a given amount of time ("rate limiting"). ... MAY include a Retry-After header indicating how long to wait before making a new request."
- Twelve-Factor processes. Fetched. https://12factor.net/processes. "Twelve-factor processes are stateless and share-nothing."
- Sticky sessions. Fetched. Same URL. "Sticky sessions are a violation of twelve-factor and should never be used or relied upon."
- Where session state goes. Fetched. Same URL. "Session state data is a good candidate for a datastore that offers time-expiration, such as Memcached or Redis."
- AWS jitter. Fetched (summarizer, via https://builder.aws.com/content/3EumjoZascWd1oZiEgL8ORlv3qE/timeouts-retries-and-backoff-with-jitter, redirect from https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/). "Jitter adds some amount of randomness to the backoff to spread the retries around in time."

## 4. Idempotency

- Stripe idempotent requests. Fetched. https://docs.stripe.com/api/idempotent_requests. "Stripe's idempotency works by saving the resulting status code and body of the first request made for any given idempotency key, regardless of whether it succeeds or fails. Subsequent requests with the same key return the same result, including 500 errors."
- Key length and retention. Fetched. Same URL. "Idempotency keys are up to 255 characters long." and "You can remove keys from the system automatically after they're at least 24 hours old. We generate a new request if a key is reused after the original is pruned."
- Parameter check. Fetched. Same URL. "The idempotency layer compares incoming parameters to those of the original request and errors if they're not the same to prevent accidental misuse."

## 5. Real-time

- WebSocket handshake. Fetched. RFC 6455 https://www.rfc-editor.org/rfc/rfc6455 (sec 1.7/1.3). "the WebSocket client's handshake is an HTTP Upgrade request" (example headers `Upgrade: websocket`, `Connection: Upgrade`, `Sec-WebSocket-Key`).
- Same port as HTTP. Fetched. Same URL. "so that a single port can be used by both HTTP clients talking to that server and WebSocket clients talking to that server."
- SSE reconnect. Fetched. https://html.spec.whatwg.org/multipage/server-sent-events.html. "Clients will reconnect if the connection is closed; a client can be told to stop reconnecting using the HTTP 204 No Content response code."
- SSE retry and last event ID. Fetched. https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events. "retry The reconnection time. If the connection to the server is lost, the browser will wait for the specified time before attempting to reconnect."
- Long polling: NOT CONFIRMED (no page fetched).
- Slack real-time. Fetched. https://slack.engineering/real-time-messaging/. "At peak times, about 16 million channels are served per host."
- Slack scale. Fetched. Same URL. "Our servers serve tens of millions of channels per host, tens of millions of connected clients, and our system delivers messages across the world in 500ms."
- Slack fan-out. Fetched. Same URL. "Each GS, on receiving this message, broadcasts to all the users websockets subscribed to this channel"
- Discord gateway (2017). Fetched (summarizer). https://discord.com/blog/how-discord-scaled-elixir-to-5-000-000-concurrent-users. "we are up to nearly five million concurrent users and millions of events per second flowing through the system."
- Discord WebSocket path. Fetched (summarizer). Same URL. "Users connect to a WebSocket and spin up a session process (a GenServer), which then communicates with remote Erlang nodes that contain guild ... processes ... When anything is published in a guild, it is fanned out to every session connected to it."

## 6. Deployment and operations

- Blue-green. Fetched. https://martinfowler.com/bliki/BlueGreenDeployment.html. "The blue-green deployment approach does this by ensuring you have two production environments, as identical as possible."
- Canary. Fetched. https://martinfowler.com/bliki/CanaryRelease.html. "Canary release is a technique to reduce the risk of introducing a new software version in production by slowly rolling out the change to a small subset of users before rolling it out to the entire infrastructure"
- Feature toggles. Fetched. https://martinfowler.com/articles/feature-toggles.html (Pete Hodgson). "Feature Toggles (often also refered to as Feature Flags) are a powerful technique, allowing teams to modify system behavior without changing code." (page is an article, not a /bliki/ page).
- Parallel change. Fetched. https://martinfowler.com/bliki/ParallelChange.html. "Parallel change, also known as expand and contract, is a pattern to implement backward-incompatible changes to an interface in a safe manner, by breaking the change into three distinct phases: expand, migrate, and contract."
- (a) Knight Capital, SEC Release No. 34-70694, 16 Oct 2013. Fetched (PDF downloaded; text read). https://www.sec.gov/files/litigation/admin/2013/34-70694.pdf
  - Missed server. "one of Knight's technicians did not copy the new code to one of the eight SMARS computer servers. Knight did not have a second technician review this deployment ... Knight had no written procedures that required such a review."
  - Repurposed flag. "The new RLP code also repurposed a flag that was formerly used to activate the Power Peg code."
  - Numbers. "4 million executions in 154 stocks for more than 397 million shares in approximately 45 minutes." and "Ultimately, Knight realized a $460 million loss on these positions."
  - Staged deploy. "Beginning on July 27, 2012, Knight deployed the new RLP code in SMARS in stages by placing it on a limited number of servers in SMARS on successive days."
- (b) Cloudflare, 2 Jul 2019. Fetched. https://blog.cloudflare.com/details-of-the-cloudflare-outage-on-july-2-2019/. "The CPU exhaustion was caused by a single WAF rule that contained a poorly written regular expression that ended up creating excessive backtracking."
  - Duration. Same URL. "the Cloudflare service went down for 27 minutes"
  - Global push. Same URL. "Being able to deploy rules quickly and globally is a critical feature of our WAF."
  - Staging gap. Same URL. "The SOP for a rule change specifically allows it to be pushed globally. This is very different from all the software we release at Cloudflare where the SOP first pushes software to an internal dogfooding network point of presence (PoP)"
- (c) CrowdStrike, 19 Jul 2024.
  - Microsoft number. Fetched (summarizer). https://blogs.microsoft.com/blog/2024/07/20/helping-our-customers-through-the-crowdstrike-outage/ (direct fetch with curl is blocked). "We currently estimate that CrowdStrike's update affected 8.5 million Windows devices, or less than one percent of all Windows machines." Also in TechCrunch, https://techcrunch.com/2024/07/20/microsoft-says-8.5m-windows-devices-were-affected-by-crowdstrike-outage (Fetched, summarizer).
  - CrowdStrike RCA. Fetched. https://www.crowdstrike.com/wp-content/uploads/2024/08/Channel-File-291-Incident-Root-Cause-Analysis-08.06.2024.pdf. Commitment: "Each Template Instance should be deployed in a staged rollout." and "New Template Instances that have passed canary testing are to be successively promoted to wider deployment rings or rolled back if problems are detected."
  - Customer control. Same PDF. "Customers can choose where and when Rapid Response Content updates are deployed."
  - "Pushed to all hosts at once": the RCA does not state this in those words. NOT CONFIRMED as a quote. The staged-rollout finding above implies it.
- (d) GitLab, 31 Jan 2017. Fetched. https://about.gitlab.com/blog/postmortem-of-database-outage-of-january-31/
  - Cause. "The outage was caused by an accidental removal of data from our primary database server."
  - Loss. "we lost modifications to database data such as projects, comments, user accounts, issues and snippets, that took place between 17:20 and 00:00 UTC on January 31. Our best estimate is that it affected roughly 5,000 projects, 5,000 comments and 700 new user accounts."
  - Deletion size. "around 300 GB of data had already been removed."
  - Backups. "the process of both finding and using backups failed completely."
  - Restore point. "the LVM snapshot created 6 hours before the outage ... (the alternative was to lose almost 24 hours of data)". Data lost window is 17:20 to 00:00 UTC (about 6.7 hours), not "6 hours".

## 7. Observability

- Four golden signals. Fetched. https://sre.google/sre-book/monitoring-distributed-systems/. "The four golden signals of monitoring are latency, traffic, errors, and saturation. If you can only measure four metrics of your user-facing system, focus on these four."
- Same page. "If you measure all four golden signals and page a human when one signal is problematic (or, in the case of saturation, nearly problematic), your service will be at least decently covered by monitoring."
- OTel metric. Fetched. https://opentelemetry.io/docs/concepts/signals/metrics/. "A metric is a measurement of a service captured at runtime."
- OTel log. Fetched. https://opentelemetry.io/docs/concepts/signals/logs/. "A log is a timestamped text record, either structured (recommended) or unstructured, with optional metadata."
- OTel traces. Fetched. https://opentelemetry.io/docs/concepts/signals/traces/. "Traces give us the big picture of what happens when a request is made to an application."

## 8. Back-of-envelope numbers

- Jeff Dean, Stanford CS295 talk (Google-hosted PDF). Fetched. https://research.google.com/people/jeff/stanford-295-talk.pdf. Slide "Numbers Everyone Should Know": L1 cache reference 0.5 ns; Branch mispredict 5 ns; L2 cache reference 7 ns; Mutex lock/unlock 100 ns; Main memory reference 100 ns; Compress 1K bytes with Zippy 10,000 ns; Send 2K bytes over 1 Gbps network 20,000 ns; Read 1 MB sequentially from memory 250,000 ns; Round trip within same datacenter 500,000 ns; Disk seek 10,000,000 ns; Read 1 MB sequentially from network 10,000,000 ns; Read 1 MB sequentially from disk 30,000,000 ns; Send packet CA->Netherlands->CA 150,000,000 ns. The talk is from about 2010 (search snippet says 2010; the slide shows no date). These are old hardware numbers: label as rough.

## Gaps

- NOT CONFIRMED: keyset pagination in PostgreSQL docs; long polling source; CrowdStrike "all hosts at once" wording; Microsoft blog text read only through a summarizer (site blocks curl).
- ElastiCache page found is the Memcached variant; no Redis-specific cache-aside page was fetched.
