"""
Embedding Utilities Template
Usage: Generate and manage embeddings for RAG, search, and similarity
"""

import os
from typing import List, Optional, Union
from dataclasses import dataclass
import numpy as np

# ===========================================
# Configuration
# ===========================================

@dataclass
class EmbeddingConfig:
    """Embedding model configuration"""
    provider: str = "openai"  # openai, google, local
    model: str = "text-embedding-3-small"
    dimensions: int = 1536
    batch_size: int = 100
    normalize: bool = True


# Provider-specific models
EMBEDDING_MODELS = {
    # OpenAI
    "text-embedding-3-small": {"provider": "openai", "dimensions": 1536},
    "text-embedding-3-large": {"provider": "openai", "dimensions": 3072},
    "text-embedding-ada-002": {"provider": "openai", "dimensions": 1536},

    # Google
    "text-embedding-004": {"provider": "google", "dimensions": 768},
    "text-multilingual-embedding-002": {"provider": "google", "dimensions": 768},

    # Local (sentence-transformers)
    "all-MiniLM-L6-v2": {"provider": "local", "dimensions": 384},
    "all-mpnet-base-v2": {"provider": "local", "dimensions": 768},
}


def get_config_from_env() -> EmbeddingConfig:
    """Load configuration from environment variables"""
    model = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
    model_info = EMBEDDING_MODELS.get(model, {})

    return EmbeddingConfig(
        provider=os.getenv("EMBEDDING_PROVIDER", model_info.get("provider", "openai")),
        model=model,
        dimensions=int(os.getenv("EMBEDDING_DIMENSIONS", model_info.get("dimensions", 1536))),
        batch_size=int(os.getenv("EMBEDDING_BATCH_SIZE", "100")),
        normalize=os.getenv("EMBEDDING_NORMALIZE", "true").lower() == "true",
    )


# ===========================================
# Embedding Client (Abstract)
# ===========================================

class EmbeddingClient:
    """Base class for embedding clients"""

    def __init__(self, config: Optional[EmbeddingConfig] = None):
        self.config = config or get_config_from_env()

    def embed(self, texts: Union[str, List[str]]) -> np.ndarray:
        """Generate embeddings for texts"""
        if isinstance(texts, str):
            texts = [texts]

        # Process in batches
        all_embeddings = []
        for i in range(0, len(texts), self.config.batch_size):
            batch = texts[i:i + self.config.batch_size]
            embeddings = self._embed_batch(batch)
            all_embeddings.extend(embeddings)

        result = np.array(all_embeddings)

        if self.config.normalize:
            result = self._normalize(result)

        return result

    def _embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Override in subclass"""
        raise NotImplementedError("Implement _embed_batch() for your provider")

    def _normalize(self, embeddings: np.ndarray) -> np.ndarray:
        """L2 normalize embeddings"""
        norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
        return embeddings / np.maximum(norms, 1e-10)


# ===========================================
# Similarity Functions
# ===========================================

def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """Compute cosine similarity between two vectors"""
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


def cosine_similarity_matrix(embeddings: np.ndarray, query: np.ndarray) -> np.ndarray:
    """Compute cosine similarity between query and all embeddings"""
    # Normalize
    embeddings_norm = embeddings / np.linalg.norm(embeddings, axis=1, keepdims=True)
    query_norm = query / np.linalg.norm(query)

    return np.dot(embeddings_norm, query_norm)


def euclidean_distance(a: np.ndarray, b: np.ndarray) -> float:
    """Compute Euclidean distance between two vectors"""
    return float(np.linalg.norm(a - b))


def dot_product(a: np.ndarray, b: np.ndarray) -> float:
    """Compute dot product between two vectors"""
    return float(np.dot(a, b))


# ===========================================
# Search Functions
# ===========================================

@dataclass
class SearchResult:
    """Search result with score and metadata"""
    index: int
    score: float
    text: Optional[str] = None
    metadata: Optional[dict] = None


def search_similar(
    query_embedding: np.ndarray,
    embeddings: np.ndarray,
    texts: Optional[List[str]] = None,
    top_k: int = 5,
    threshold: float = 0.0,
) -> List[SearchResult]:
    """Find most similar embeddings to query"""

    # Compute similarities
    similarities = cosine_similarity_matrix(embeddings, query_embedding)

    # Get top-k indices
    top_indices = np.argsort(similarities)[::-1][:top_k]

    results = []
    for idx in top_indices:
        score = float(similarities[idx])
        if score < threshold:
            continue

        results.append(SearchResult(
            index=int(idx),
            score=score,
            text=texts[idx] if texts else None,
        ))

    return results


def deduplicate_by_similarity(
    embeddings: np.ndarray,
    threshold: float = 0.95,
) -> List[int]:
    """Remove near-duplicate embeddings, return unique indices"""

    n = len(embeddings)
    unique_indices = []

    for i in range(n):
        is_duplicate = False
        for j in unique_indices:
            sim = cosine_similarity(embeddings[i], embeddings[j])
            if sim >= threshold:
                is_duplicate = True
                break

        if not is_duplicate:
            unique_indices.append(i)

    return unique_indices


# ===========================================
# Text Chunking
# ===========================================

def chunk_text(
    text: str,
    chunk_size: int = 500,
    overlap: int = 50,
    separator: str = "\n",
) -> List[str]:
    """Split text into overlapping chunks"""

    # Split by separator first
    paragraphs = text.split(separator)

    chunks = []
    current_chunk = []
    current_size = 0

    for para in paragraphs:
        para_size = len(para)

        if current_size + para_size > chunk_size and current_chunk:
            # Save current chunk
            chunks.append(separator.join(current_chunk))

            # Keep overlap
            overlap_text = separator.join(current_chunk)
            if len(overlap_text) > overlap:
                # Find a good break point for overlap
                current_chunk = [current_chunk[-1]] if current_chunk else []
                current_size = len(current_chunk[-1]) if current_chunk else 0
            else:
                current_chunk = []
                current_size = 0

        current_chunk.append(para)
        current_size += para_size

    # Don't forget the last chunk
    if current_chunk:
        chunks.append(separator.join(current_chunk))

    return chunks


def chunk_by_tokens(
    text: str,
    max_tokens: int = 500,
    overlap_tokens: int = 50,
) -> List[str]:
    """Split text by approximate token count (4 chars ≈ 1 token)"""

    chars_per_token = 4
    chunk_size = max_tokens * chars_per_token
    overlap = overlap_tokens * chars_per_token

    chunks = []
    start = 0

    while start < len(text):
        end = start + chunk_size

        # Try to break at sentence boundary
        if end < len(text):
            for boundary in [". ", "! ", "? ", "\n"]:
                last_boundary = text.rfind(boundary, start, end)
                if last_boundary > start:
                    end = last_boundary + len(boundary)
                    break

        chunks.append(text[start:end].strip())
        start = end - overlap

    return [c for c in chunks if c]  # Remove empty chunks


# ===========================================
# Caching
# ===========================================

class EmbeddingCache:
    """Simple in-memory cache for embeddings"""

    def __init__(self, max_size: int = 10000):
        self.cache: dict = {}
        self.max_size = max_size

    def get(self, text: str) -> Optional[np.ndarray]:
        """Get cached embedding"""
        return self.cache.get(hash(text))

    def set(self, text: str, embedding: np.ndarray) -> None:
        """Cache embedding"""
        if len(self.cache) >= self.max_size:
            # Simple eviction: remove first item
            first_key = next(iter(self.cache))
            del self.cache[first_key]

        self.cache[hash(text)] = embedding

    def get_or_compute(
        self,
        text: str,
        compute_fn: callable,
    ) -> np.ndarray:
        """Get from cache or compute"""
        cached = self.get(text)
        if cached is not None:
            return cached

        embedding = compute_fn(text)
        self.set(text, embedding)
        return embedding


# ===========================================
# Usage Example
# ===========================================

"""
from embedding_utils import (
    EmbeddingClient,
    get_config_from_env,
    search_similar,
    chunk_text,
)

# Initialize client
client = EmbeddingClient(get_config_from_env())

# Generate embeddings
texts = ["Hello world", "How are you?", "Machine learning is great"]
embeddings = client.embed(texts)

# Search
query_embedding = client.embed("Hi there")[0]
results = search_similar(query_embedding, embeddings, texts, top_k=2)

for r in results:
    print(f"{r.score:.3f}: {r.text}")

# Chunk long text
long_text = open("document.txt").read()
chunks = chunk_text(long_text, chunk_size=500, overlap=50)
chunk_embeddings = client.embed(chunks)
"""
