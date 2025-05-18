# AI Validation Service

This service uses Google's Gemini API to validate prediction market questions for clarity, objectivity, and verifiability.

## Setup

1. Get Gemini API keys from [Google AI Studio](https://ai.google.dev/)
2. Add your API keys to `.env.local`:

```
NEXT_PUBLIC_GEMINI_API_KEY1=your_key_here
NEXT_PUBLIC_GEMINI_API_KEY2=your_key_here
# Add more keys as needed
```

## Handling API Quota Issues

If you encounter quota exceeded errors with the Gemini API, you have several options:

### Option 1: Use Local Validation

Set the following in `.env.local`:

```
NEXT_PUBLIC_USE_LOCAL_VALIDATION=true
```

This will bypass the AI API and use a basic rule-based validation system.

### Option 2: Add More API Keys

You can add multiple API keys to distribute the load:

```
NEXT_PUBLIC_GEMINI_API_KEY1=key1
NEXT_PUBLIC_GEMINI_API_KEY2=key2
NEXT_PUBLIC_GEMINI_API_KEY3=key3
# etc...
```

The service will rotate through these keys when rate limits are hit.

### Option 3: Upgrade Your API Plan

For production use, consider upgrading to a paid Gemini API plan with higher quotas.
Visit [Google AI Platform pricing](https://cloud.google.com/vertex-ai/pricing) for details.

## Troubleshooting

If you're still encountering issues:

1. Check your API quota usage in the Google Cloud Console
2. Verify that your API keys are correct and have the necessary permissions
3. Try using a different model (change `model: "gemini-1.5-pro"` in the code)
4. Implement a more restrictive rate-limiting mechanism in your application
