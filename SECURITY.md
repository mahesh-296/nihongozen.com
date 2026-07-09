# Security Notes

- Do not commit `.env` files or private API keys.
- Do not reuse API keys from the source zip. Create fresh Firebase public web config values.
- The static frontend only needs Firebase public client config for the selected auth plan.
- OpenAI, Gemini, Anthropic, Perplexity, Stripe secret keys, Supabase service keys, database credentials, and cloud secret values must not appear in this app.
- GitHub Pages cannot enforce HttpOnly cookies, SameSite server cookies, CSRF tokens, backend RBAC, refresh-token rotation, server-side malware scanning, encrypted backups, or private DB networking.
- Production authorization must be enforced with Firebase Security Rules or a backend API, never with frontend role checks alone.
