---
name: content-platforms
description: CMS, blogging platforms, and content management patterns
domain: domain-applications
version: 1.0.0
tags: [cms, blog, content, markdown, rich-text, media]
---

# Content Platforms

## Overview

Building content management systems, blogging platforms, and rich media applications.

---

## Content Models

### Headless CMS Schema

```typescript
// Content types
interface ContentType {
  id: string;
  name: string;
  slug: string;
  fields: Field[];
  settings: ContentTypeSettings;
}

interface Field {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
  localized: boolean;
  validation?: FieldValidation;
}

type FieldType =
  | 'text'
  | 'richText'
  | 'number'
  | 'boolean'
  | 'date'
  | 'media'
  | 'reference'
  | 'array'
  | 'json';

// Blog post content type
const blogPostType: ContentType = {
  id: 'blogPost',
  name: 'Blog Post',
  slug: 'blog-posts',
  fields: [
    { id: 'title', name: 'Title', type: 'text', required: true, localized: true },
    { id: 'slug', name: 'Slug', type: 'text', required: true, localized: false },
    { id: 'content', name: 'Content', type: 'richText', required: true, localized: true },
    { id: 'excerpt', name: 'Excerpt', type: 'text', required: false, localized: true },
    { id: 'featuredImage', name: 'Featured Image', type: 'media', required: false, localized: false },
    { id: 'author', name: 'Author', type: 'reference', required: true, localized: false },
    { id: 'tags', name: 'Tags', type: 'array', required: false, localized: false },
    { id: 'publishedAt', name: 'Published At', type: 'date', required: false, localized: false },
    { id: 'seo', name: 'SEO', type: 'json', required: false, localized: true },
  ],
  settings: {
    previewable: true,
    versionable: true,
    publishable: true,
  },
};

// Prisma schema
/*
model Content {
  id            String   @id @default(cuid())
  contentTypeId String
  status        String   @default("draft")
  data          Json
  locale        String   @default("en")
  version       Int      @default(1)
  publishedAt   DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([contentTypeId, status])
  @@index([contentTypeId, locale])
}
*/
```

### Rich Text Editor

```tsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';

function RichTextEditor({
  content,
  onChange,
}: {
  content: string;
  onChange: (content: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: true }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Start writing...' }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div className="editor-wrapper">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="prose max-w-none" />
    </div>
  );
}

function MenuBar({ editor }: { editor: Editor }) {
  return (
    <div className="menu-bar">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'active' : ''}
      >
        Bold
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'active' : ''}
      >
        Italic
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive('heading', { level: 2 }) ? 'active' : ''}
      >
        H2
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'active' : ''}
      >
        Bullet List
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={editor.isActive('codeBlock') ? 'active' : ''}
      >
        Code Block
      </button>
      <button onClick={() => addImage(editor)}>Image</button>
      <button onClick={() => addLink(editor)}>Link</button>
    </div>
  );
}
```

---

## Media Management

```typescript
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sharp from 'sharp';

const s3 = new S3Client({ region: process.env.AWS_REGION });

interface MediaAsset {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  alt?: string;
}

// Upload with image processing
async function uploadMedia(file: Express.Multer.File): Promise<MediaAsset> {
  const id = crypto.randomUUID();
  const extension = path.extname(file.originalname);
  const key = `media/${id}${extension}`;

  let processedBuffer = file.buffer;
  let width: number | undefined;
  let height: number | undefined;

  // Process images
  if (file.mimetype.startsWith('image/')) {
    const image = sharp(file.buffer);
    const metadata = await image.metadata();
    width = metadata.width;
    height = metadata.height;

    // Resize if too large
    if (width && width > 2000) {
      processedBuffer = await image
        .resize(2000, null, { withoutEnlargement: true })
        .toBuffer();
    }

    // Generate thumbnail
    const thumbnail = await image
      .resize(300, 300, { fit: 'cover' })
      .webp({ quality: 80 })
      .toBuffer();

    await s3.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: `thumbnails/${id}.webp`,
      Body: thumbnail,
      ContentType: 'image/webp',
    }));
  }

  // Upload original
  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: processedBuffer,
    ContentType: file.mimetype,
  }));

  // Save to database
  return prisma.media.create({
    data: {
      id,
      filename: file.originalname,
      mimeType: file.mimetype,
      size: processedBuffer.length,
      url: `${process.env.CDN_URL}/${key}`,
      thumbnailUrl: file.mimetype.startsWith('image/')
        ? `${process.env.CDN_URL}/thumbnails/${id}.webp`
        : undefined,
      width,
      height,
    },
  });
}

// Image optimization on-the-fly (with caching)
async function getOptimizedImage(
  key: string,
  options: { width?: number; height?: number; format?: 'webp' | 'avif' | 'jpeg' }
) {
  const cacheKey = `optimized/${key}/${JSON.stringify(options)}`;

  // Check cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return Buffer.from(cached, 'base64');
  }

  // Get original
  const original = await s3.send(new GetObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
  }));

  // Process
  let image = sharp(await original.Body?.transformToByteArray());

  if (options.width || options.height) {
    image = image.resize(options.width, options.height, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  if (options.format) {
    image = image.toFormat(options.format, { quality: 80 });
  }

  const buffer = await image.toBuffer();

  // Cache for 1 hour
  await redis.setex(cacheKey, 3600, buffer.toString('base64'));

  return buffer;
}
```

---

## Content Versioning

```typescript
interface ContentVersion {
  id: string;
  contentId: string;
  version: number;
  data: Record<string, any>;
  createdBy: string;
  createdAt: Date;
  changeDescription?: string;
}

// Create new version
async function createVersion(
  contentId: string,
  data: Record<string, any>,
  userId: string,
  description?: string
) {
  const current = await prisma.content.findUnique({
    where: { id: contentId },
  });

  // Save current as version
  await prisma.contentVersion.create({
    data: {
      contentId,
      version: current.version,
      data: current.data,
      createdBy: userId,
      changeDescription: description,
    },
  });

  // Update content
  return prisma.content.update({
    where: { id: contentId },
    data: {
      data,
      version: { increment: 1 },
    },
  });
}

// Get version history
async function getVersionHistory(contentId: string) {
  return prisma.contentVersion.findMany({
    where: { contentId },
    orderBy: { version: 'desc' },
    include: {
      createdByUser: { select: { name: true, avatar: true } },
    },
  });
}

// Restore version
async function restoreVersion(contentId: string, versionNumber: number, userId: string) {
  const version = await prisma.contentVersion.findFirst({
    where: { contentId, version: versionNumber },
  });

  if (!version) {
    throw new Error('Version not found');
  }

  return createVersion(contentId, version.data, userId, `Restored from version ${versionNumber}`);
}

// Diff between versions
function diffVersions(oldVersion: ContentVersion, newVersion: ContentVersion) {
  // Using deep-diff or similar library
  const diff = require('deep-diff');
  return diff(oldVersion.data, newVersion.data);
}
```

---

## Publishing Workflow

```typescript
enum ContentStatus {
  DRAFT = 'draft',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

// Workflow transitions
const workflowTransitions: Record<ContentStatus, ContentStatus[]> = {
  [ContentStatus.DRAFT]: [ContentStatus.IN_REVIEW],
  [ContentStatus.IN_REVIEW]: [ContentStatus.DRAFT, ContentStatus.APPROVED],
  [ContentStatus.APPROVED]: [ContentStatus.IN_REVIEW, ContentStatus.PUBLISHED],
  [ContentStatus.PUBLISHED]: [ContentStatus.ARCHIVED],
  [ContentStatus.ARCHIVED]: [ContentStatus.DRAFT],
};

async function transitionContent(
  contentId: string,
  newStatus: ContentStatus,
  userId: string,
  comment?: string
) {
  const content = await prisma.content.findUnique({ where: { id: contentId } });

  const allowedTransitions = workflowTransitions[content.status];
  if (!allowedTransitions.includes(newStatus)) {
    throw new Error(`Cannot transition from ${content.status} to ${newStatus}`);
  }

  // Log transition
  await prisma.contentWorkflowLog.create({
    data: {
      contentId,
      fromStatus: content.status,
      toStatus: newStatus,
      userId,
      comment,
    },
  });

  // Update content
  return prisma.content.update({
    where: { id: contentId },
    data: {
      status: newStatus,
      ...(newStatus === ContentStatus.PUBLISHED && { publishedAt: new Date() }),
    },
  });
}

// Schedule publishing
async function schedulePublish(contentId: string, publishAt: Date) {
  await prisma.content.update({
    where: { id: contentId },
    data: {
      scheduledPublishAt: publishAt,
      status: ContentStatus.APPROVED,
    },
  });

  // Queue job
  await queue.add('publish-content', { contentId }, {
    delay: publishAt.getTime() - Date.now(),
  });
}
```

---

## SEO & Metadata

```typescript
interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: string;
  canonical?: string;
  noIndex?: boolean;
}

function generateSEOTags(meta: SEOMetadata, url: string) {
  return {
    title: meta.title,
    meta: [
      { name: 'description', content: meta.description },
      meta.keywords && { name: 'keywords', content: meta.keywords.join(', ') },
      meta.noIndex && { name: 'robots', content: 'noindex, nofollow' },

      // Open Graph
      { property: 'og:title', content: meta.title },
      { property: 'og:description', content: meta.description },
      { property: 'og:type', content: meta.ogType || 'article' },
      { property: 'og:url', content: url },
      meta.ogImage && { property: 'og:image', content: meta.ogImage },

      // Twitter
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: meta.title },
      { name: 'twitter:description', content: meta.description },
      meta.ogImage && { name: 'twitter:image', content: meta.ogImage },
    ].filter(Boolean),
    link: [
      meta.canonical && { rel: 'canonical', href: meta.canonical },
    ].filter(Boolean),
  };
}
```

---

## Related Skills

- [[frontend]] - Content rendering
- [[database]] - Content storage
- [[cloud-platforms]] - Media hosting

