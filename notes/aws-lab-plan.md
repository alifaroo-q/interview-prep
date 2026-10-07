# AWS explainer: lab plan

Real labs use the `aws` tool (lab server): a shell in `xp-aws` with the real AWS CLI v2, pointed at Floci 2.2.0 (`xp-floci`, floci.io) on `http://floci:4566`. Floci checks IAM policies (`FLOCI_SERVICES_IAM_ENFORCEMENT_ENABLED=true`), runs EC2 instances, ECS tasks and Lambda functions as real containers, and has a real ALB data plane with health checks. Helper scripts are in `lab/aws/` (on PATH as `/lab`). ALB targets are the three `orders-*` whoami containers, reached through Toxiproxy (`web-1..3`, ports 23001-23003) so a lab can cut one off.

Floci gaps found while probing (2026-10-07), so these parts use model labs or avoid the preset:
- ALB with all targets unhealthy closes the connection; real AWS fails open. A dead target that is not yet marked unhealthy gives a reset, real AWS gives 502.
- Auto Scaling keeps the desired count and replaces terminated instances, but scaling policies make no CloudWatch alarms, so target tracking does nothing. It also put every instance in one AZ.
- A VPC with a /8 block is accepted (AWS allows /16 to /28).
- Route 53 and CloudFront are control plane only (no DNS answers, no edge cache).
- EC2 user data did not run; IMDS is on a different address.
- EKS starts k3s nodes in Docker: too heavy for a lab, model lab only.
- RDS starts real PostgreSQL; the PostgreSQL explainer already has real labs, so this chapter uses a model lab.

| # | Chapter | Mechanism | Hidden state | Tier | Break it |
|---|---|---|---|---|---|
| 1 | The AWS map | Regions, AZs, every action is a signed HTTPS API call | per-AZ app copies; real: the SigV4 `Authorization` header from `aws --debug` | 3 + 2 | one-AZ app when its AZ fails; wrong secret key: SignatureDoesNotMatch |
| 2 | VPS vs EC2 | fixed bundle vs pay per second, many instance sizes, Spot | cost and capacity over a day of traffic; real: instance state machine | 3 + 2 | VPS overloaded at peak; Spot reclaimed with 2-minute notice; start a terminated instance |
| 3 | Storage for servers | EBS (network disk, one AZ), instance store (host disk), EFS (shared NFS) | which copy of the data survives each event | 3 | instance store after stop; EBS volume in other AZ |
| 4 | VPC | route tables (longest prefix), IGW, NAT, SG (stateful), NACL (stateless) | packet trace hop by hop; real: subnet free IPs, route table | 3 + 2 | NACL without ephemeral ports drops replies; private subnet without NAT; overlapping CIDR |
| 5 | IAM | default deny, allow, explicit deny wins, roles and trust | decision trace per policy type; real: AccessDenied and `simulate-principal-policy` | 3 + 2 | explicit deny beats allow; role trust that does not name the caller |
| 6 | S3 | bucket + key, flat namespace, versioning, conditional write, presigned URL | real: object list, versions and delete markers, ETag | 2 | delete with versioning keeps data; overwrite race (If-None-Match 412); expired presigned URL |
| 7 | Load balancers | listener, rules, target group, health checks | real: target health states, which replica answered | 3 + 2 | one target cut off; all targets unhealthy (fail open, model) |
| 8 | Auto Scaling | desired / min / max reconcile loop, target tracking | real: instance list and scaling activities; model: CPU and capacity over time | 3 + 2 | desired outside min/max; max too low; no warmup |
| 9 | ECS and Fargate | task definition, service keeps desired count, rolling deploy | real: tasks, running count, service events; model: rolling deploy | 3 + 2 | stopped task replaced; bad image in deploy |
| 10 | EKS | managed control plane, reconcile loop, node groups | pods per node, Pending pods | 3 | node lost; node group at max: Pending |
| 11 | Lambda | execution environment reuse, concurrency | real: invocation counter inside one environment; model: concurrency = rate x duration | 3 + 2 | global state kept between calls; timeout; throttling at the concurrency limit |
| 12 | API Gateway | token bucket throttling, integration timeout | bucket tokens over time | 3 | burst above the bucket: 429; backend slower than 29 s: 504 |
| 13 | RDS and Aurora | sync standby, async replicas, Aurora 6 copies / quorum | commit log on each copy, failover timeline | 3 | stale read from async replica; promote a lagging replica loses writes; lose 3 of 6 copies |
| 14 | DynamoDB | partition key hashing, capacity units, conditional writes | per-partition load; real: consumed capacity | 3 + 2 | hot partition key; Scan cost; conditional write fails |
| 15 | ElastiCache | cache-aside and write-through, TTL | cache vs database values; real Redis TTL | 3 + 2 | stale value after a DB update; cold cache after node loss |
| 16 | SQS | visibility timeout, at-least-once, DLQ | real: visible / in flight counts, receive count, DLQ | 2 | consumer crash: message comes back; poison message goes to DLQ |
| 17 | SNS and EventBridge | fan-out, filter policies, rules | real: which queue got which message | 2 | filter that drops a message; rule pattern with a typo |
| 18 | CloudFront | cache behaviors, cache key, TTL, OAC | behavior match trace, cache entries | 3 | wrong behavior order; all query strings in the key |
| 19 | Route 53 | routing policies, health checks, TTL | answers per resolver over time | 3 | failover waits for the TTL |
| 20 | KMS and Secrets Manager | envelope encryption, 4 KB limit, secret versions | real: data key and its encrypted copy, version labels | 2 | 5,000 bytes to Encrypt fails |
| 21 | CloudWatch and CloudTrail | metrics, alarm states, API audit trail | real: alarm state change, metric statistics | 2 | alarm with no data stays INSUFFICIENT_DATA |
| 22 | A whole app | three tiers over AZs | per-component AZ placement | 3 | AZ failure with single-AZ parts |
