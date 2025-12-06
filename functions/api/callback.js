// /functions/api/callback.js
// Gère le callback de GitHub et renvoie le token au CMS

export async function onRequest(context) {
  const { env, request } = context;
  
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  
  if (!code) {
    return new Response('Error: No authorization code provided', { status: 400 });
  }
  
  const CLIENT_ID = env.GITHUB_CLIENT_ID;
  const CLIENT_SECRET = env.GITHUB_CLIENT_SECRET;
  const CALLBACK_URL = `${url.origin}/api/callback`;
  
  try {
    // Échanger le code pour un access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: code,
        redirect_uri: CALLBACK_URL
      })
    });
    
    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      return new Response(`GitHub OAuth Error: ${tokenData.error_description}`, { 
        status: 400 
      });
    }
    
    // Page HTML qui renvoie le token au CMS via postMessage
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Authentification réussie</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #0077be 0%, #00a8e8 100%);
            color: white;
          }
          .container {
            text-align: center;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          }
          h1 { margin: 0 0 1rem 0; }
          .spinner {
            margin: 2rem auto;
            width: 50px;
            height: 50px;
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>✅ Authentification réussie!</h1>
          <p>Retour au CMS...</p>
          <div class="spinner"></div>
        </div>
        <script>
          (function() {
            // Message formaté pour Decap CMS
            const message = {
              type: 'authorization',
              provider: 'github',
              token: '${tokenData.access_token}'
            };
            
            // Envoyer au CMS (window.opener)
            if (window.opener) {
              window.opener.postMessage(
                'authorization:github:success:' + JSON.stringify(message),
                '*'
              );
              
              console.log('Token envoyé au CMS');
              
              // Fermer la popup après 1 seconde
              setTimeout(function() {
                window.close();
              }, 1000);
            } else {
              console.error('window.opener is null - popup may have been blocked');
            }
          })();
        </script>
      </body>
      </html>
    `;
    
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html;charset=UTF-8'
      }
    });
    
  } catch (error) {
    return new Response(`Server Error: ${error.message}`, { status: 500 });
  }
}