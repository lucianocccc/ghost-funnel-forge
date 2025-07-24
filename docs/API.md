# GhostFunnel API Documentation

## Overview

GhostFunnel provides a comprehensive API for managing funnels, leads, and AI-powered features through Supabase Edge Functions.

## Authentication

All API endpoints require authentication using JWT tokens from Supabase Auth.

```typescript
// Example authentication header
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

## Edge Functions

### AI Funnel Generation

**Endpoint**: `POST /functions/v1/generate-funnel-ai`

Generate AI-powered funnel configurations based on lead data.

```typescript
// Request
{
  "leadId": "uuid",
  "preferences": {
    "industry": "string",
    "targetAudience": "string",
    "goals": ["string"]
  }
}

// Response
{
  "success": boolean,
  "funnel": {
    "id": "uuid",
    "name": "string",
    "structure": object,
    "recommendations": ["string"]
  }
}
```

### Interactive Funnel Generation

**Endpoint**: `POST /functions/v1/generate-interactive-funnel-ai`

Create interactive funnel experiences with AI assistance.

```typescript
// Request
{
  "prompt": "string",
  "context": object,
  "preferences": object
}

// Response
{
  "success": boolean,
  "funnel": object,
  "interactiveElements": object[]
}
```

### Chatbot AI

**Endpoint**: `POST /functions/v1/chatbot-ai`

Interact with the AI assistant for various tasks.

```typescript
// Request
{
  "message": "string",
  "sessionId": "string",
  "context": object,
  "settings": {
    "personality": "professional" | "friendly" | "formal",
    "language": "italian" | "english",
    "specialization": "marketing" | "sales" | "general"
  }
}

// Response
{
  "response": "string",
  "sessionId": "string",
  "suggestedActions": ["string"]
}
```

### Deep Thinking AI

**Endpoint**: `POST /functions/v1/chatbot-deep-thinking`

Advanced AI analysis with detailed reasoning.

```typescript
// Request
{
  "query": "string",
  "context": object,
  "analysisType": "market" | "competitive" | "strategic"
}

// Response
{
  "analysis": "string",
  "reasoning": "string",
  "recommendations": ["string"],
  "confidence": number
}
```

### Lead Analysis

**Endpoint**: `POST /functions/v1/analyze-lead`

Analyze and score leads using AI.

```typescript
// Request
{
  "leadId": "uuid",
  "analysisDepth": "basic" | "detailed"
}

// Response
{
  "score": number,
  "insights": {
    "strengths": ["string"],
    "concerns": ["string"],
    "recommendations": ["string"]
  },
  "nextActions": ["string"]
}
```

## Database API

### Tables

#### Profiles
- `GET /rest/v1/profiles` - Get user profiles
- `POST /rest/v1/profiles` - Create profile
- `PATCH /rest/v1/profiles?id=eq.{id}` - Update profile

#### Funnels
- `GET /rest/v1/funnels` - Get user funnels
- `POST /rest/v1/funnels` - Create funnel
- `PATCH /rest/v1/funnels?id=eq.{id}` - Update funnel
- `DELETE /rest/v1/funnels?id=eq.{id}` - Delete funnel

#### Leads
- `GET /rest/v1/leads` - Get leads
- `POST /rest/v1/leads` - Create lead
- `PATCH /rest/v1/leads?id=eq.{id}` - Update lead

#### AI Credits
- `GET /rest/v1/ai_credits` - Get credit balance
- `POST /rest/v1/ai_credits` - Purchase credits

## Error Handling

### HTTP Status Codes
- `200`: Success
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `429`: Too Many Requests
- `500`: Internal Server Error

### Error Response Format
```typescript
{
  "error": {
    "code": "string",
    "message": "string",
    "details": object
  }
}
```

## Rate Limiting

- **Standard endpoints**: 100 requests per minute
- **AI endpoints**: 20 requests per minute
- **Bulk operations**: 10 requests per minute

## Webhook Events

### Funnel Events
- `funnel.created`
- `funnel.updated`
- `funnel.deleted`

### Lead Events
- `lead.created`
- `lead.scored`
- `lead.converted`

### Subscription Events
- `subscription.created`
- `subscription.updated`
- `subscription.cancelled`

## SDK Usage Examples

### JavaScript/TypeScript
```typescript
import { supabase } from './supabase-client';

// Generate AI funnel
const { data, error } = await supabase.functions.invoke('generate-funnel-ai', {
  body: { leadId: '12345', preferences: { industry: 'tech' } }
});

// Query database
const { data: funnels } = await supabase
  .from('funnels')
  .select('*')
  .eq('user_id', userId);
```

### Python
```python
import requests

# AI funnel generation
response = requests.post(
    f"{supabase_url}/functions/v1/generate-funnel-ai",
    headers={"Authorization": f"Bearer {token}"},
    json={"leadId": "12345", "preferences": {"industry": "tech"}}
)
```

## Best Practices

### Performance
- Use pagination for large datasets
- Implement caching where appropriate
- Batch operations when possible
- Monitor API usage

### Security
- Never expose API keys in client-side code
- Validate all inputs
- Use HTTPS for all requests
- Implement proper error handling

### Reliability
- Implement retry logic with exponential backoff
- Handle rate limits gracefully
- Use idempotent operations
- Monitor API health
