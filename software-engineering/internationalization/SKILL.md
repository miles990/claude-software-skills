---
schema: "1.0"
name: internationalization
version: "1.0.0"
description: 國際化與本地化開發：i18n/l10n 架構設計、翻譯管理、多語言應用最佳實踐
triggers: [i18n, l10n, 國際化, 本地化, 多語言, 翻譯, internationalization, localization, translation, multilingual, locale, language]
keywords: [software-engineering, i18n, l10n, translation]
author: claude-software-skills
---

# 國際化與本地化 Internationalization & Localization

> 讓你的應用程式走向全世界

## 核心概念

```
┌─────────────────────────────────────────────────────────────────┐
│  i18n vs l10n                                                    │
│                                                                 │
│  國際化 (Internationalization - i18n)                           │
│  ├─ 設計支援多語言的架構                                        │
│  ├─ 抽離可翻譯的字串                                            │
│  ├─ 處理日期、數字、貨幣格式                                    │
│  └─ 一次性工程工作                                              │
│                                                                 │
│  本地化 (Localization - l10n)                                   │
│  ├─ 針對特定語言/地區的翻譯                                     │
│  ├─ 文化適應（圖片、顏色、符號）                                │
│  ├─ 法規遵循（隱私、內容）                                      │
│  └─ 持續性工作                                                  │
│                                                                 │
│  i18n = 讓應用「能」支援多語言                                  │
│  l10n = 讓應用「實際」支援某語言                                │
└─────────────────────────────────────────────────────────────────┘
```

## 適用場景

- 新專案的多語言架構設計
- 現有專案添加多語言支援
- 翻譯工作流程優化
- RTL (右到左) 語言支援
- 日期/數字/貨幣格式化

## i18n 架構設計

### 翻譯檔案結構

```
推薦結構：按語言分類
locales/
├── en/
│   ├── common.json      # 共用詞彙
│   ├── home.json        # 首頁
│   └── settings.json    # 設定頁
├── zh-TW/
│   ├── common.json
│   ├── home.json
│   └── settings.json
└── ja/
    ├── common.json
    ├── home.json
    └── settings.json

替代結構：按功能分類
locales/
├── common/
│   ├── en.json
│   ├── zh-TW.json
│   └── ja.json
└── settings/
    ├── en.json
    ├── zh-TW.json
    └── ja.json
```

### 翻譯 Key 命名規範

```markdown
## 命名原則

1. **階層式命名**
   ✅ `settings.notifications.email.title`
   ❌ `settingsNotificationsEmailTitle`

2. **語意優先於位置**
   ✅ `action.save`, `action.cancel`
   ❌ `button1`, `button2`

3. **避免縮寫**
   ✅ `error.network.timeout`
   ❌ `err.net.to`

4. **使用英文小寫**
   ✅ `user.profile.avatar`
   ❌ `User.Profile.Avatar`

## 常用前綴

| 前綴 | 用途 | 範例 |
|------|------|------|
| `action.` | 動作按鈕 | `action.submit`, `action.delete` |
| `label.` | 表單標籤 | `label.email`, `label.password` |
| `error.` | 錯誤訊息 | `error.required`, `error.invalid` |
| `message.` | 一般訊息 | `message.success`, `message.loading` |
| `title.` | 頁面標題 | `title.home`, `title.settings` |
| `hint.` | 提示文字 | `hint.password_format` |
```

## 主流框架實作

### React (react-i18next)

```typescript
// i18n.ts - 配置
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'zh-TW', 'ja'],
    ns: ['common', 'home', 'settings'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator'],
      caches: ['localStorage', 'cookie'],
    },
  });

// 使用
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation();

  return (
    <div>
      <h1>{t('title.welcome')}</h1>
      <p>{t('message.greeting', { name: 'John' })}</p>
      <button onClick={() => i18n.changeLanguage('zh-TW')}>
        中文
      </button>
    </div>
  );
}
```

### Vue (vue-i18n)

```typescript
// i18n.ts
import { createI18n } from 'vue-i18n';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: { /* ... */ },
    'zh-TW': { /* ... */ },
  },
});

// 使用
<template>
  <h1>{{ $t('title.welcome') }}</h1>
  <p>{{ $t('message.greeting', { name: 'John' }) }}</p>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
const { t, locale } = useI18n();
</script>
```

### Next.js (next-intl)

```typescript
// middleware.ts
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'zh-TW', 'ja'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
});

// app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

export default async function LocaleLayout({
  children,
  params: { locale }
}) {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}

// 使用
import { useTranslations } from 'next-intl';

function Page() {
  const t = useTranslations('home');
  return <h1>{t('title')}</h1>;
}
```

## 複雜翻譯處理

### 複數形式 (Pluralization)

```json
// en.json
{
  "items": {
    "zero": "No items",
    "one": "{{count}} item",
    "other": "{{count}} items"
  }
}

// zh-TW.json (中文無複數變化)
{
  "items": "{{count}} 個項目"
}

// 使用
t('items', { count: 5 }) // "5 items" / "5 個項目"
```

### 插值與格式化

```json
{
  "greeting": "Hello, {{name}}!",
  "date": "Today is {{date, datetime}}",
  "price": "Price: {{amount, currency}}",
  "percent": "{{value, percent}} complete"
}
```

```typescript
// 使用 Intl API
t('date', { date: new Date() });
t('price', { amount: 99.99 });
t('percent', { value: 0.85 });
```

### 巢狀與引用

```json
{
  "common": {
    "app_name": "MyApp"
  },
  "welcome": "Welcome to $t(common.app_name)!",
  "footer": "© 2024 $t(common.app_name). All rights reserved."
}
```

## 日期時間處理

```typescript
// 使用 Intl.DateTimeFormat
const formatDate = (date: Date, locale: string) => {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

formatDate(new Date(), 'en-US');    // "January 7, 2024"
formatDate(new Date(), 'zh-TW');    // "2024年1月7日"
formatDate(new Date(), 'ja-JP');    // "2024年1月7日"

// 相對時間
const formatRelative = (date: Date, locale: string) => {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const diff = Math.round((date.getTime() - Date.now()) / 86400000);
  return rtf.format(diff, 'day');
};

formatRelative(yesterday, 'en');    // "yesterday"
formatRelative(yesterday, 'zh-TW'); // "昨天"
```

## 數字與貨幣

```typescript
// 數字格式化
const formatNumber = (num: number, locale: string) => {
  return new Intl.NumberFormat(locale).format(num);
};

formatNumber(1234567.89, 'en-US');  // "1,234,567.89"
formatNumber(1234567.89, 'de-DE');  // "1.234.567,89"
formatNumber(1234567.89, 'zh-TW');  // "1,234,567.89"

// 貨幣格式化
const formatCurrency = (amount: number, currency: string, locale: string) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
};

formatCurrency(99.99, 'USD', 'en-US');  // "$99.99"
formatCurrency(99.99, 'TWD', 'zh-TW');  // "NT$99.99"
formatCurrency(99.99, 'JPY', 'ja-JP');  // "￥100"
```

## RTL 語言支援

```
┌─────────────────────────────────────────────────────────────────┐
│  RTL (Right-to-Left) 支援                                        │
│                                                                 │
│  RTL 語言：阿拉伯語、希伯來語、波斯語、烏爾都語                │
│                                                                 │
│  HTML 設定                                                      │
│  <html lang="ar" dir="rtl">                                     │
│                                                                 │
│  CSS 邏輯屬性                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  LTR 屬性        →  邏輯屬性                            │   │
│  │  margin-left     →  margin-inline-start                 │   │
│  │  margin-right    →  margin-inline-end                   │   │
│  │  padding-left    →  padding-inline-start                │   │
│  │  text-align:left →  text-align: start                   │   │
│  │  float: left     →  float: inline-start                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  自動翻轉                                                       │
│  • 圖標方向（箭頭、導航）                                       │
│  • 表單欄位順序                                                 │
│  • 滾動方向                                                     │
└─────────────────────────────────────────────────────────────────┘
```

### RTL CSS 範例

```css
/* 使用 CSS 邏輯屬性 */
.card {
  margin-inline-start: 1rem;
  padding-inline-end: 2rem;
  border-inline-start: 3px solid blue;
}

/* 針對 RTL 調整 */
[dir="rtl"] .icon-arrow {
  transform: scaleX(-1);
}

/* 使用 :dir() 偽類 */
.nav:dir(rtl) {
  flex-direction: row-reverse;
}
```

## 翻譯工作流程

```
┌─────────────────────────────────────────────────────────────────┐
│  翻譯工作流程                                                    │
│                                                                 │
│  開發者                         翻譯人員                        │
│     │                              │                            │
│     │  1. 新增 key + 預設文字     │                            │
│     ├─────────────────────────────→│                            │
│     │                              │                            │
│     │  2. 同步到翻譯平台          │                            │
│     ├─────────────────────────────→│                            │
│     │                              │                            │
│     │  3. 翻譯 + 審核             │                            │
│     │←─────────────────────────────┤                            │
│     │                              │                            │
│     │  4. 拉取翻譯檔案            │                            │
│     ├─────────────────────────────→│                            │
│     │                              │                            │
│     │  5. 測試 + 發布             │                            │
│     ▼                              │                            │
│                                                                 │
│  工具推薦：                                                     │
│  • Lokalise, Crowdin, Phrase                                   │
│  • Weblate (開源)                                              │
│  • POEditor                                                     │
└─────────────────────────────────────────────────────────────────┘
```

## 翻譯品質保證

```markdown
## 翻譯 Checklist

### 技術檢查
- [ ] 所有 key 都有翻譯
- [ ] 插值變數正確
- [ ] 複數形式完整
- [ ] 特殊字元正確轉義
- [ ] HTML 標籤完整

### 內容檢查
- [ ] 翻譯準確
- [ ] 語氣一致
- [ ] 專有名詞統一
- [ ] 長度適中（UI 不溢出）
- [ ] 文化適宜

### 自動化測試
```typescript
// 檢查遺漏翻譯
function checkMissingTranslations(
  defaultLocale: object,
  targetLocale: object,
  path: string = ''
) {
  const missing: string[] = [];

  for (const key in defaultLocale) {
    const currentPath = path ? `${path}.${key}` : key;

    if (!(key in targetLocale)) {
      missing.push(currentPath);
    } else if (typeof defaultLocale[key] === 'object') {
      missing.push(...checkMissingTranslations(
        defaultLocale[key],
        targetLocale[key],
        currentPath
      ));
    }
  }

  return missing;
}
```

## 常見問題與解決

| 問題 | 解決方案 |
|------|----------|
| 翻譯後文字太長 | 預留空間、使用縮寫、調整 UI |
| 專有名詞不一致 | 建立術語表 (Glossary) |
| 翻譯遺漏 | CI 自動檢查 |
| 上下文不清 | 為翻譯者提供截圖和說明 |
| 硬編碼字串 | ESLint 規則檢查 |
| 動態內容翻譯 | 使用插值，避免字串拼接 |

## 效能優化

```markdown
## 翻譯載入策略

### 1. 按需載入
只載入當前語言，切換時再載入
```typescript
const loadLocale = async (locale: string) => {
  const messages = await import(`./locales/${locale}.json`);
  i18n.addResourceBundle(locale, 'translation', messages);
};
```

### 2. 命名空間分割
按頁面/功能分割翻譯檔案
```typescript
// 只載入首頁需要的翻譯
await i18n.loadNamespaces(['common', 'home']);
```

### 3. 預載入常用語言
```typescript
// 預載入可能使用的語言
const preloadLocales = ['en', 'zh-TW'];
preloadLocales.forEach(locale => {
  i18n.loadLanguages(locale);
});
```

### 4. 快取策略
使用 Service Worker 快取翻譯檔案
```

## 工具推薦

### 翻譯管理平台
- **Lokalise** - 開發者友好，支援多種格式
- **Crowdin** - 社群翻譯，開源專案免費
- **Phrase** - 企業級，強大的工作流程

### 開發工具
- **i18n Ally** - VS Code 擴展，即時預覽
- **eslint-plugin-i18n** - 檢查硬編碼字串
- **FormatJS** - 強大的格式化工具集

### 測試工具
- **pseudolocalization** - 偽本地化測試
- **i18next-parser** - 自動提取 key

## 最佳實踐總結

```markdown
## DO ✅

1. 從專案開始就考慮 i18n
2. 使用語意化的 key 命名
3. 避免字串拼接，使用插值
4. 為翻譯者提供上下文
5. 自動化翻譯檢查
6. 測試所有支援的語言

## DON'T ❌

1. 硬編碼任何用戶可見文字
2. 假設所有語言長度相同
3. 在 key 中使用預設文字
4. 忽略複數和性別變化
5. 手動管理翻譯同步
6. 忽略 RTL 語言需求
```
