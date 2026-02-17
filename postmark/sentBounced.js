export default {
  async fetch(request, env) {

    // --- Load secrets via Secrets Store ---
    const APIKey = await env.POSTMARK_API.get();

    // --- Validate secrets ---
    if (!APIKey) {
      return new Response(JSON.stringify({
        error: "Missing POSTMARK_API"
      }), { status: 500 });
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split("T")[0];

    try {
      const resp = await fetch(
        `https://api.postmarkapp.com/stats/outbound?fromdate=${dateStr}&todate=${dateStr}`,
        {
          headers: {
            "X-Postmark-Server-Token": `${APIKey}`,
            "Accept": "application/json",
            "Access-Control-Allow-Origin": "*",
            "User-Agent": "Cloudflare-Worker/1.0"
          }
        }
      );

      if (!resp.ok) {
        return new Response(
          JSON.stringify({ error: `HTTP ${resp.status}` }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      const json = await resp.json();

      // return a flat object
      return new Response(
        JSON.stringify({
          Sent: json.Sent ?? 0,
          Bounced: json.Bounced ?? 0,
          SpamComplaints: json.SpamComplaints ?? 0
        }, null, 2),
        { headers: { "Content-Type": "application/json" } }
      );

    } catch (e) {
      return new Response(
        JSON.stringify({ error: e.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }
};