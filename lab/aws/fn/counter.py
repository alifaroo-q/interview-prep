# Lambda lab function. Code outside the handler runs once per execution environment (the Init phase).
import os, time, uuid
ENV_ID = uuid.uuid4().hex[:8]
STARTED = time.time()
calls = 0

def handler(event, context):
    global calls
    calls += 1
    time.sleep(event.get("sleep", 0))
    return {"env": ENV_ID, "calls_in_this_env": calls, "env_age_s": round(time.time() - STARTED, 1)}
