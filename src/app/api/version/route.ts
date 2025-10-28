// app/api/version/route.ts
export const dynamic = "force-dynamic"; // 静的化させない

export async function GET() {
  const body = {
    ok: true,
    version: process.env.APP_VERSION,
    git: process.env.GIT_SHA,
    imageTag: process.env.IMAGE_TAG,
    buildTime: process.env.BUILD_TIME,
    node: process.version,
    timestamp: new Date().toISOString(),
  };

  return new Response(JSON.stringify(body), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
