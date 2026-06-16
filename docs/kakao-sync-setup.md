# Kakao Sync setup checklist

This project only prepares the frontend entry point. Do not place app secrets in client code.

## Environment variables

Add these values in Vercel Project Settings and local `.env.local`.

```env
NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=
NEXT_PUBLIC_KAKAO_REST_API_KEY=
NEXT_PUBLIC_KAKAO_REDIRECT_URI=https://afterstockvietnam.vercel.app/auth/kakao/callback
```

`NEXT_PUBLIC_KAKAO_REST_API_KEY` is listed for backend handoff reference. Token exchange should happen on the backend, not in the browser.

## Kakao Developers

1. Create or select the Kakao Developers app.
2. Confirm JavaScript Key and REST API Key.
3. Enable Kakao Login.
4. Register redirect URI: `https://afterstockvietnam.vercel.app/auth/kakao/callback`.
5. Add the local redirect URI for development when needed: `http://localhost:3000/auth/kakao/callback`.
6. Request Kakao Sync/business conversion and configure consent items.
7. Check service terms, privacy policy, and Kakao Channel connection requirements.
8. Prepare backend callback API for authorization-code token exchange.
9. Replace the current `afterstock_mock_user` localStorage flow with server session/JWT handling.

## Frontend locations

- Kakao button and SDK initialization: `components/auth/kakao-start-button.tsx`
- Callback page: `app/auth/kakao/callback/page.tsx`
- Mock callback client: `app/auth/kakao/callback/kakao-callback-client.tsx`
- Interest setup placeholder: `app/onboarding/interests/page.tsx`
