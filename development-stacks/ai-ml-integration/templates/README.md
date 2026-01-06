# AI/ML Integration Templates

Configuration and utility templates for LLM and embedding integration.

## Files

| Template | Purpose |
|----------|---------|
| `llm-config.ts` | Multi-provider LLM configuration with retry/fallback |
| `embedding-utils.py` | Embedding generation, search, and chunking utilities |

## Usage

### LLM Configuration (TypeScript)

```typescript
import {
  createLLMClient,
  getConfigFromEnv,
  withRetry,
  withFallback,
} from './llm-config';

// Simple usage
const client = createLLMClient({
  provider: 'openai',
  model: 'gpt-4o-mini',
  apiKey: process.env.OPENAI_API_KEY,
});

const response = await client.complete('Hello!');

// With retry on rate limits
const response = await withRetry(
  () => client.complete('Hello!'),
  { maxRetries: 3, initialDelay: 1000 }
);

// With fallback providers
const response = await withFallback(
  () => createLLMClient({ model: 'gpt-4o' }).complete('Hello!'),
  [
    () => createLLMClient({ provider: 'anthropic', model: 'claude-sonnet' }).complete('Hello!'),
    () => createLLMClient({ provider: 'google', model: 'gemini-pro' }).complete('Hello!'),
  ]
);
```

### Embedding Utilities (Python)

```python
from embedding_utils import (
    EmbeddingClient,
    search_similar,
    chunk_text,
    cosine_similarity,
)

# Initialize client
client = EmbeddingClient()

# Generate embeddings
texts = ["Machine learning", "Deep learning", "Natural language"]
embeddings = client.embed(texts)

# Search similar
query = client.embed("AI techniques")[0]
results = search_similar(query, embeddings, texts, top_k=2)

# Chunk long documents
chunks = chunk_text(long_document, chunk_size=500, overlap=50)
chunk_embeddings = client.embed(chunks)
```

## Environment Variables

### LLM
```bash
LLM_PROVIDER=openai          # openai, anthropic, google, azure, local
LLM_MODEL=gpt-4o-mini
LLM_MAX_TOKENS=4096
LLM_TEMPERATURE=0.7
LLM_TIMEOUT=30000

OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
```

### Embeddings
```bash
EMBEDDING_PROVIDER=openai
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1536
EMBEDDING_BATCH_SIZE=100
EMBEDDING_NORMALIZE=true
```

## Supported Models

### LLM Providers
| Provider | Models |
|----------|--------|
| OpenAI | gpt-4o, gpt-4o-mini |
| Anthropic | claude-sonnet, claude-haiku |
| Google | gemini-pro |
| Local | llama3 (Ollama) |

### Embedding Models
| Provider | Models | Dimensions |
|----------|--------|------------|
| OpenAI | text-embedding-3-small | 1536 |
| OpenAI | text-embedding-3-large | 3072 |
| Google | text-embedding-004 | 768 |
| Local | all-MiniLM-L6-v2 | 384 |

## Key Features

### LLM Config
- Multi-provider support
- Exponential backoff retry
- Provider fallback chain
- Rate limit handling

### Embedding Utils
- Batch processing
- L2 normalization
- Similarity search
- Text chunking (by chars or tokens)
- Deduplication
- In-memory caching

## Integration Examples

### RAG Pipeline
```python
# 1. Chunk documents
chunks = chunk_text(document, chunk_size=500)

# 2. Generate embeddings
embeddings = client.embed(chunks)

# 3. Search relevant chunks
query_emb = client.embed(user_query)[0]
results = search_similar(query_emb, embeddings, chunks, top_k=3)

# 4. Build context
context = "\n".join([r.text for r in results])

# 5. Generate response
response = llm.complete(f"Context: {context}\n\nQuestion: {user_query}")
```

### Semantic Cache
```python
cache = EmbeddingCache(max_size=10000)

def cached_embed(text):
    return cache.get_or_compute(
        text,
        lambda t: client.embed(t)[0]
    )
```
