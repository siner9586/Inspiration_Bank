export interface Env {
  APP_CRON_URL: string;
  CRON_SECRET?: string;
}

type ScheduledEvent = {
  scheduledTime: number;
  cron: string;
};

type ExecutionContext = {
  waitUntil(promise: Promise<unknown>): void;
};

async function callIdeaInterest(env: Env) {
  if (!env.APP_CRON_URL) {
    console.log("APP_CRON_URL is not configured. Skip idea interest cron.");
    return;
  }

  const url = `${env.APP_CRON_URL.replace(/\/$/, "")}/api/cron/idea-interest?limit=20&provider=zero-cost`;
  const headers: HeadersInit = {};
  if (env.CRON_SECRET) {
    headers.Authorization = `Bearer ${env.CRON_SECRET}`;
  }

  const response = await fetch(url, { headers });
  const text = await response.text();
  console.log(`idea-interest status=${response.status} body=${text.slice(0, 500)}`);
}

const worker = {
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext) {
    await callIdeaInterest(env);
  },
  async fetch(_request: Request, env: Env) {
    await callIdeaInterest(env);
    return new Response("idea-interest cron triggered", { status: 200 });
  }
};

export default worker;
