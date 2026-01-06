/**
 * CMS Schema Template
 * Usage: Core types for content management systems
 */

// ===========================================
// Content Types
// ===========================================

export interface Content {
  id: string;
  type: ContentType;
  title: string;
  slug: string;
  status: ContentStatus;
  visibility: ContentVisibility;
  author: Author;
  content: ContentBody;
  metadata: ContentMetadata;
  seo: SEOMetadata;
  scheduling: SchedulingConfig;
  revisions: Revision[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export type ContentType =
  | 'article'
  | 'page'
  | 'blog_post'
  | 'news'
  | 'product'
  | 'landing_page'
  | 'documentation'
  | 'faq';

export type ContentStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'published'
  | 'archived'
  | 'deleted';

export type ContentVisibility = 'public' | 'private' | 'password_protected' | 'members_only';

// ===========================================
// Content Body
// ===========================================

export interface ContentBody {
  format: 'html' | 'markdown' | 'blocks' | 'rich_text';
  raw: string;
  rendered?: string;
  blocks?: ContentBlock[];
  excerpt?: string;
  wordCount?: number;
  readingTime?: number; // minutes
}

export interface ContentBlock {
  id: string;
  type: BlockType;
  data: Record<string, unknown>;
  children?: ContentBlock[];
}

export type BlockType =
  | 'paragraph'
  | 'heading'
  | 'image'
  | 'video'
  | 'embed'
  | 'code'
  | 'quote'
  | 'list'
  | 'table'
  | 'divider'
  | 'callout'
  | 'accordion'
  | 'gallery'
  | 'cta';

// ===========================================
// Media & Assets
// ===========================================

export interface Media {
  id: string;
  type: MediaType;
  filename: string;
  originalFilename: string;
  mimeType: string;
  size: number; // bytes
  url: string;
  thumbnails?: Record<string, string>;
  dimensions?: { width: number; height: number };
  duration?: number; // seconds for audio/video
  alt?: string;
  caption?: string;
  metadata: MediaMetadata;
  uploadedBy: string;
  uploadedAt: Date;
}

export type MediaType = 'image' | 'video' | 'audio' | 'document' | 'archive';

export interface MediaMetadata {
  folderId?: string;
  tags: string[];
  exif?: Record<string, unknown>;
  blurhash?: string;
  dominantColor?: string;
}

// ===========================================
// Taxonomy
// ===========================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  order: number;
  metadata?: Record<string, unknown>;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  count: number; // number of contents using this tag
}

export interface Taxonomy {
  categories: Category[];
  tags: Tag[];
  customTaxonomies?: CustomTaxonomy[];
}

export interface CustomTaxonomy {
  id: string;
  name: string;
  slug: string;
  hierarchical: boolean;
  terms: TaxonomyTerm[];
}

export interface TaxonomyTerm {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
}

// ===========================================
// Author & Users
// ===========================================

export interface Author {
  id: string;
  name: string;
  slug: string;
  email: string;
  avatar?: string;
  bio?: string;
  socialLinks?: SocialLinks;
  role: AuthorRole;
}

export type AuthorRole = 'admin' | 'editor' | 'author' | 'contributor' | 'subscriber';

export interface SocialLinks {
  twitter?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

// ===========================================
// SEO & Metadata
// ===========================================

export interface ContentMetadata {
  categoryIds: string[];
  tagIds: string[];
  featuredImage?: Media;
  customFields: Record<string, unknown>;
  relatedContentIds: string[];
  language: string;
  translations?: Record<string, string>; // language -> contentId
}

export interface SEOMetadata {
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  noIndex?: boolean;
  noFollow?: boolean;
  schema?: Record<string, unknown>; // JSON-LD structured data
}

// ===========================================
// Scheduling & Workflow
// ===========================================

export interface SchedulingConfig {
  publishAt?: Date;
  unpublishAt?: Date;
  timezone: string;
}

export interface Revision {
  id: string;
  version: number;
  content: ContentBody;
  authorId: string;
  createdAt: Date;
  comment?: string;
  changes?: ContentDiff[];
}

export interface ContentDiff {
  field: string;
  before: unknown;
  after: unknown;
}

// ===========================================
// Comments & Engagement
// ===========================================

export interface Comment {
  id: string;
  contentId: string;
  parentId?: string;
  author: CommentAuthor;
  body: string;
  status: CommentStatus;
  createdAt: Date;
  updatedAt?: Date;
  likes: number;
  replies?: Comment[];
}

export interface CommentAuthor {
  id?: string;
  name: string;
  email: string;
  website?: string;
  isRegistered: boolean;
}

export type CommentStatus = 'pending' | 'approved' | 'spam' | 'deleted';

// ===========================================
// CMS Configuration
// ===========================================

export interface CMSConfig {
  siteName: string;
  siteUrl: string;
  defaultLanguage: string;
  supportedLanguages: string[];
  mediaUpload: MediaUploadConfig;
  contentTypes: ContentTypeConfig[];
  workflows: WorkflowConfig[];
}

export interface MediaUploadConfig {
  maxFileSize: number; // bytes
  allowedMimeTypes: string[];
  storagePath: string;
  cdnUrl?: string;
  imageOptimization: {
    enabled: boolean;
    quality: number;
    formats: ('webp' | 'avif')[];
  };
}

export interface ContentTypeConfig {
  type: ContentType;
  label: string;
  fields: FieldDefinition[];
  templates: string[];
  defaultTemplate: string;
}

export interface FieldDefinition {
  name: string;
  type: 'text' | 'richtext' | 'number' | 'date' | 'media' | 'relation' | 'select' | 'boolean';
  label: string;
  required: boolean;
  defaultValue?: unknown;
  validation?: Record<string, unknown>;
}

export interface WorkflowConfig {
  name: string;
  stages: WorkflowStage[];
  transitions: WorkflowTransition[];
}

export interface WorkflowStage {
  id: string;
  name: string;
  status: ContentStatus;
  permissions: string[];
}

export interface WorkflowTransition {
  from: string;
  to: string;
  conditions?: Record<string, unknown>;
  actions?: string[];
}
