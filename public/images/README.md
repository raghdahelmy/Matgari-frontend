# Project Images

This folder contains all the AI-generated / custom photos used across the marketing site.

## How to add a new image

1. Generate the image using the prompt below in **Midjourney / DALL-E / Leonardo.ai / Ideogram / ChatGPT**.
2. Save it with the exact filename listed (jpg or png).
3. Drop it in this folder (`public/images/`).
4. The site will pick it up automatically — no code changes needed.

---

## 📸 Image Inventory

### 1. `about-hero.jpg`

**Used in:** `/about` page (the big banner with the mission statement)
**Size:** 1600x900 (landscape, hero ratio)

**Prompt:**
```
A vibrant, cheerful photo capturing the moment of a successful sale in a busy retail store. A smiling female entrepreneur is standing behind a modern point-of-sale (POS) counter. A customer is happily tapping their phone to pay. The POS screen displays "Payment Successful!" with a graphical burst of subtle gold coins and a green checkmark. The shop owner is looking at the screen with a look of pure relief and happiness. Bright, natural daylight flooding the store, creating a warm and positive atmosphere. Realistic, detailed, high-definition.
```

---

## 🖼️ Other images in the project (still using Unsplash)

If you'd like to replace any of these with custom AI images later, here's where they live:

### Hero Section (homepage `/`)
- **Browser mockup hero banner** — `src/components/Hero.tsx` (`heroImage` constant)
- **3 product photos** — Linen Blazer, Suede Sneaker, Gold Ring

### Story Section (homepage `/`)
- **3 lifestyle photos** — `src/components/OurStory.tsx`
  - Craftsmanship (artisan working)
  - Community (smiling group)
  - Growth (nature/abstract)

### Features Page (`/features`)
- **4 section photos** — `src/app/[locale]/features/page.tsx` (`sectionImages`)
  - Products management
  - Store / storefront
  - Orders / shipping
  - Marketing / SEO

### Demo Store Page (`/demo`)
- **Store hero banner** — `src/components/demo/DemoHero.tsx`
- **5 category photos** — `src/components/demo/DemoCategories.tsx`
- **8 product photos** — `src/components/demo/DemoFeatured.tsx`
- **Newsletter background** — `src/components/demo/DemoNewsletter.tsx`

To replace any of these:
1. Generate/find the image
2. Save it here as e.g. `hero-mockup.jpg`, `feature-products.jpg` etc.
3. Replace the Unsplash URL in the corresponding component file with `/images/your-filename.jpg`
