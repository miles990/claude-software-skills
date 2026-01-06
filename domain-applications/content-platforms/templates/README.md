# Content Platforms Templates

Schema templates for content management systems.

## Files

| Template | Purpose |
|----------|---------|
| `cms-schema.ts` | Core CMS type definitions |

## Usage

```bash
# Copy template
cp templates/cms-schema.ts ./src/types/cms.ts

# Import types
import type { Content, Media, Category } from './types/cms';
```

## Schema Overview

### Content Structure

```
Content
├── id, slug, title
├── type (article, page, blog_post, ...)
├── status (draft, published, ...)
├── visibility (public, private, ...)
├── content (body, format, blocks)
├── metadata (categories, tags, customFields)
├── seo (meta tags, OG, schema)
├── scheduling (publish/unpublish dates)
└── revisions[]
```

### Key Types

| Type | Description |
|------|-------------|
| `Content` | Main content entity |
| `ContentBody` | Content format and data |
| `ContentBlock` | Block-based content |
| `Media` | Media/asset management |
| `Category` | Hierarchical taxonomy |
| `Tag` | Flat taxonomy |
| `Author` | Content creator |
| `SEOMetadata` | Search optimization |
| `Revision` | Version history |
| `Comment` | User engagement |

### Content Types

```typescript
type ContentType =
  | 'article'       // News articles
  | 'page'          // Static pages
  | 'blog_post'     // Blog entries
  | 'news'          // News items
  | 'product'       // Product pages
  | 'landing_page'  // Marketing pages
  | 'documentation' // Docs
  | 'faq';          // FAQ entries
```

### Content Status

```
draft → pending_review → approved → published → archived
                                        ↓
                                    deleted
```

## Block-Based Content

```typescript
const blocks: ContentBlock[] = [
  { id: '1', type: 'heading', data: { level: 1, text: 'Title' } },
  { id: '2', type: 'paragraph', data: { text: 'Content...' } },
  { id: '3', type: 'image', data: { src: '/img.jpg', alt: 'Image' } },
  { id: '4', type: 'code', data: { language: 'ts', code: '...' } },
];
```

## Media Management

```typescript
const media: Media = {
  id: 'media_123',
  type: 'image',
  filename: 'hero.webp',
  mimeType: 'image/webp',
  size: 102400,
  url: 'https://cdn.example.com/hero.webp',
  thumbnails: {
    small: '...thumbnail-300.webp',
    medium: '...thumbnail-600.webp',
  },
  dimensions: { width: 1920, height: 1080 },
};
```

## SEO Configuration

```typescript
const seo: SEOMetadata = {
  metaTitle: 'Page Title | Site Name',
  metaDescription: 'Description under 160 chars',
  canonicalUrl: 'https://example.com/page',
  ogImage: 'https://example.com/og.jpg',
  schema: {
    '@context': 'https://schema.org',
    '@type': 'Article',
    // ...
  },
};
```

## Workflow Example

```typescript
const workflow: WorkflowConfig = {
  name: 'Editorial',
  stages: [
    { id: 'draft', name: 'Draft', status: 'draft', permissions: ['author'] },
    { id: 'review', name: 'Review', status: 'pending_review', permissions: ['editor'] },
    { id: 'publish', name: 'Published', status: 'published', permissions: ['admin'] },
  ],
  transitions: [
    { from: 'draft', to: 'review' },
    { from: 'review', to: 'draft' },
    { from: 'review', to: 'publish' },
  ],
};
```

## Customization

### Add Custom Content Type

```typescript
// Extend ContentType
type ContentType =
  | 'article'
  // ... existing types
  | 'recipe';  // Custom type

// Add field definitions
const recipeFields: FieldDefinition[] = [
  { name: 'ingredients', type: 'richtext', label: 'Ingredients', required: true },
  { name: 'cookTime', type: 'number', label: 'Cook Time (min)', required: true },
];
```

### Add Custom Field

```typescript
interface ContentMetadata {
  // ... existing fields
  customFields: {
    featured: boolean;
    priority: number;
    externalId?: string;
  };
}
```
