// src/index.js

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // début du login : redirection vers GitHub OAuth
    if (url.pathname === "/auth") {
      const params = new URLSearchParams({
        client_id: env.GITHUB_CLIENT_ID,
        redirect_uri: env.REDIRECT_URI,
        scope: "repo",
      });
      const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
      return Response.redirect(authUrl, 302);
    }

    // callback après login GitHub
    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");
      if (!code) {
        return new Response("Code GitHub absent", { status: 400 });
      }

      // échange code → token
      const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: env.REDIRECT_URI,
        }),
      });

      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) {
        return new Response("Erreur OAuth GitHub", { status: 500 });
      }
      const token = tokenData.access_token;

      // Réponse pour Decap CMS (popup)
      return new Response(`<html><body>
        <script>
          window.opener.postMessage("authorization:github:success:${token}", window.origin);
          window.close();
        </script>
      </body></html>`, {
        headers: { "Content-Type": "text/html" }
      });
    }

    // racine → simple test
    return new Response("Decap OAuth Proxy opérationnel", { status: 200 });
  }
};