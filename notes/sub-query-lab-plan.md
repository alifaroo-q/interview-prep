# Correlated subquery explainer: lab plan

Input: `notes/sub-query.md` (a LinkedIn post about a 29 second query, and a Gemini fact check of it).
Sources: PostgreSQL 18 docs (14.1 Using EXPLAIN, 7.8.3 CTE Materialization, 11.9 Index-Only Scans, 9.21 Aggregate Functions, 4.2.11 Scalar Subqueries, 7.2.1.5 LATERAL, 19.7 Query Planning, 51.6 Executor), PostgreSQL 12 release notes, `src/backend/optimizer/plan/subselect.c`. Checked 2026-10-13.

Data: `categories` (15), `products` (3,000), `reviews` (3,000; products 2701 to 3000 have none). Tier 2 uses `sq_*` tables with 30,000 rows, the size in the post.

The numbers in the notes that Gemini wrote as "EXPLAIN output" are not measured. Every plan in the explainer comes from a real run. Three claims in the notes changed after measurement:

- Buffers in the slow plan are `loops x pages of reviews`, all hits. The notes show `read=1200000`, which no run produced.
- The index alone removes almost all of the time, the same as the rewrite alone. The first answer in the notes ("virtually all from the rewrite") does not hold. The later answer in the notes agrees with the measurement.
- The rewrite is slower than the correlated subquery when the outer query keeps few rows and the filter is not on the join column.

| # | Chapter | Covers (notes §) | Mechanism | Hidden state | Tier | Break it |
|---|---|---|---|---|---|---|
| 1 | The 29 second query | Post; fact-check summary table; step-by-step §1 | a scalar subquery that reads an outer column | execution time of both query forms | 1 | the slow form on the same data |
| 2 | How a correlated subquery runs | Fact-check 1; step-by-step §2 steps 1 and 2 | SubPlan runs once for each outer row | outer row pointer, rows checked, SubPlan runs; real: `loops=` | 3 + 1 | scale to 30,000 x 30,000; outer rows 750 / 1,500 / 3,000 |
| 3 | Read loops in EXPLAIN ANALYZE | Raw plans §1 and §2 "what to look for" | time and rows are averages for each loop, buffers are totals | total per node = time x loops; pages of `reviews` | 3 + 1 | reading 0.229 ms as the cost of the scan |
| 4 | The join was not the problem | Fact-check 2; minimal rewrite; step-by-step §2 step 3 | Hash Join: build once, probe once | hash build node, `Rows Removed by Join Filter` | 1 | hash and merge join off: nested loop, 9 million pair checks |
| 5 | The rewrite: aggregate once, then join | Fact-check 3; step-by-step §3 A and B; CTE note | HashAggregate in one pass, then Hash Left Join | hash table of groups; real: `loops=1`, `Group Key` | 3 + 1 | INNER JOIN drops 300 products; `count` gives NULL, not 0; MATERIALIZED CTE |
| 6 | The index without the rewrite | Index on correlated subquery (all 3 parts) | Index Scan inside the SubPlan, loops stay | `Index Searches`, buffers for each loop, `bt_metap` tree level | 1 | an expression on the column: Seq Scan comes back |
| 7 | Index Only Scan against one pass | Index Only Scan §1 to §5; mechanical comparison | covering index + visibility map | `Heap Fetches`, `pg_visibility_map_summary` | 1 | UPDATE without VACUUM: heap fetches return |
| 8 | Measure the two changes apart | Fact-check 4; step-by-step §4; takeaway table | 2 x 2 experiment: rewrite and index | execution time of all four cases, at 3,000 and 30,000 rows | 1 + 2 | 30,000 rows on a real server: the slow case runs for many seconds |
| 9 | When the correlated subquery is correct | Step-by-step §4 "where the indexes do help" | filter pushdown into the grouped subquery; LATERAL | rows aggregated against rows needed | 1 | filter on `name`: the rewrite aggregates all reviews for 1 product |
