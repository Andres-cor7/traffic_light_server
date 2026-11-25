export async function POST(request) {
  const body = await request.text();
  try {
    const res = await fetch(`${process.env.BACKEND_URL}/api/position`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.API_TOKEN}`,
      },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    return new Response(await res.text(), {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return Response.json({ error: "Backend no disponible" }, { status: 502 });
  }
}