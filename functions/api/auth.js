// /functions/api/auth.js
// Initie l'authentification GitHub OAuth

export async function onRequest(context) {
  const { env, request } = context;
  
  const url = new URL(request.url);
  const origin = url.origin;
  
  const CLIENT_ID = env.GITHUB_CLIENT_ID;
  const CALLBACK_URL = `${origin}/api/callback`;
  
  // Construire l'URL d'autorisation GitHub
  const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
  githubAuthUrl.searchParams.set('client_id', CLIENT_ID);
  githubAuthUrl.searchParams.set('redirect_uri', CALLBACK_URL);
  githubAuthUrl.searchParams.set('scope', 'repo,user');
  
  // Rediriger vers GitHub
  return Response.redirect(githubAuthUrl.toString(), 302);
}










