# Live Chat Endpoint Setup

The AIChatPanel now supports using a live chat endpoint that requires authentication. This allows you to use the deployed chat API instead of calling OpenAI directly.

## Environment Variables

Add the following environment variable to your `.env` file:

```bash
# OpenAI API key (optional - highest priority if present)
VITE_OPENAI_API_KEY=your-openai-api-key

# Live Chat API endpoint (optional - defaults to the deployed endpoint)
VITE_LIVE_CHAT_URL=https://unigraph-routes-7mmkabtzc-aesgraph.vercel.app/api/chat

# Supabase configuration (required for live chat authentication)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## How It Works

1. **OpenAI Priority**: If an OpenAI API key is configured, it will be used first
2. **Live Chat Fallback**: If no OpenAI key but user is signed in, the live chat endpoint will be used
3. **LLM Studio Fallback**: If neither OpenAI nor live chat is available, it will fall back to LLM Studio
4. **Automatic Token Management**: The panel automatically uses the current Supabase session token for authentication

## Provider Selection Logic

The chat panel automatically selects the best available provider:

1. **OpenAI** (if API key is available) - Direct OpenAI API calls
2. **Live Chat** (if user is signed in) - Uses the deployed chat API
3. **LLM Studio** (if running locally) - Local LLM Studio instance

## Features

- ✅ Automatic authentication using Supabase session
- ✅ Fallback to other providers if live chat is unavailable
- ✅ Visual indicators showing current provider and authentication status
- ✅ Settings panel showing endpoint URL and auth status
- ✅ Error handling with helpful messages

## Testing

To test the live chat endpoint:

1. Make sure you're signed in via Supabase
2. Open the AI Chat Panel
3. Check that it shows "Live Chat" as the provider
4. Send a message to test the connection

The panel will show authentication status and any connection errors in the settings panel.
