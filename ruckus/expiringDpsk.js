export default {
  async fetch(request, env) {

    // --- Load secrets via Secrets Store ---
    const CLIENT_ID = await env.RUCKUS_CLIENT_ID.get();
    const CLIENT_SECRET = await env.RUCKUS_CLIENT_SECRET.get();

    // --- User-provided constants ---
    const POOL_ID = "<YOUR POOL ID>";
    const TENANT_ID = "<YOUR TENANT ID>";

    // --- Validate secrets ---
    if (!CLIENT_ID || !CLIENT_SECRET) {
      return new Response(JSON.stringify({
        error: "Missing RUCKUS_CLIENT_ID or RUCKUS_CLIENT_SECRET"
      }), { status: 500 });
    }

    // --- 1. Get OAuth token ---
    async function getToken() {
      const resp = await fetch(`https://eu.ruckus.cloud/oauth2/token/${TENANT_ID}`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET
        })
      });

      if (!resp.ok) {
        throw new Error(`Token request failed: ${resp.status}`);
      }

      const json = await resp.json();
      return json.access_token;
    }

    // --- 2. Retrieve all DPSKs in the pool (paginated) ---
    async function getAllPassphrases(token) {
      let all = [];
      let page = 0;
      const size = 100;

      while (true) {
        const url = `https://api.eu.ruckus.cloud/dpskServices/${POOL_ID}/passphrases?page=${page}&size=${size}`;
        
        const resp = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json"
          }
        });

        if (!resp.ok) {
          throw new Error(`DPSK fetch failed: ${resp.status}`);
        }

        const json = await resp.json();
        all.push(...json.content);

        if (json.last) break;
        page++;
      }

      return all;
    }

    // --- 3. Filter DPSKs expiring soon ---
    function filterExpiring(passphrases, days = 14) {
      const now = new Date();
      const cutoff = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

      return passphrases.filter(p => {
        if (!p.expirationDate) return false;
        const exp = new Date(p.expirationDate);
        return exp >= now && exp <= cutoff;
      });
    }

    // --- Put it all together ---
    try {
      const token = await getToken();
      const allPassphrases = await getAllPassphrases(token);
      const expiring = filterExpiring(allPassphrases);

      return new Response(JSON.stringify({
        totalPassphrases: allPassphrases.length,
        expiringIn14Days: expiring.length,
        expiringList: expiring.map(p => ({
          id: p.id,
          username: p.username,
          passphrase: p.passphrase,
          expirationDate: p.expirationDate
        }))
      }, null, 2), {
        headers: { "Content-Type": "application/json" }
      });

    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
};
