# Repository Size Analysis

## 📊 **Overall Repository Size Breakdown**

| Directory | Size       | Description                  |
| --------- | ---------- | ---------------------------- |
| `public/` | 27M        | Static assets and data files |
| `docs/`   | 17M        | Documentation and built site |
| `src/`    | 7.5M       | Source code                  |
| **Total** | **~51.5M** | **Main repository**          |

## 🎯 **Largest File Categories**

### 1. **Story Card Images** (17M - `public/storyCardFiles/`)

**Recommendation: MOVE TO SEPARATE REPOSITORY**

**Largest files:**

- `chatgpt_alethiometer.png` (2.1M)
- `40d47b0e-335e-410f-9e6c-162ec2d13f37.png` (1.9M)
- `manhattanExplains.png` (1.9M)
- `conceptArt.png` (1.7M)
- Multiple "Pasted Graphic" files (1.5M each)

**Rationale:**

- These are concept art and story card assets
- Not essential for core application functionality
- Can be downloaded on-demand when needed
- 17M is a significant portion of the repository

### 2. **Documentation Site Assets** (9.4M - `docs/_site/`)

**Recommendation: MOVE TO SEPARATE REPOSITORY**

**Largest files:**

- `view_reactFlow.jpg` (1.1M)
- `exampleSvg.png` (673K)
- `unifinished-unigraphV0.png` (662K)
- `unigraph-mesh.png` (627K)
- `view_forceGraph3d.jpg` (589K)

**Rationale:**

- This is a built site that can be regenerated
- Documentation assets can be hosted separately
- Reduces main repository size significantly
- Can be served from CDN or separate hosting

### 3. **Demo Images** (7.7M - `public/images/`)

**Recommendation: MOVE TO SEPARATE REPOSITORY**

**Largest files:**

- `Untitled_Artwork 263.png` (1.7M)
- `Untitled_Artwork 257.png` (626K)
- `slide1.png` (595K)
- Multiple demo gallery images (400-500K each)

**Rationale:**

- Demo assets are not essential for core functionality
- Can be loaded on-demand for demos
- Significant size reduction potential

### 4. **Large Data Files**

#### **Tree of Life Dataset** (1.6M total)

**Recommendation: MOVE TO SEPARATE REPOSITORY**

- `treeoflife_nodes.csv` (1.2M)
- `treeoflife_links.csv` (401K)

**Rationale:**

- Scientific dataset that can be downloaded separately
- Not essential for core application
- Can be fetched from external source when needed

#### **Image Boxes Data** (1.4M - `src/assets/imageBoxes/imageBoxes263.ts`)

**Recommendation: MOVE TO SEPARATE REPOSITORY**

- 61,277 lines of TypeScript data
- Contains image box annotations for artwork
- Generated data that can be recreated

**Rationale:**

- This is generated/annotated data, not source code
- Can be loaded dynamically when needed
- Reduces main repository size significantly

## 🚀 **Recommended Action Plan**

### **Phase 1: High Impact, Low Risk**

1. **Move Story Card Files** (17M → 0M)
   - Create `unigraph-story-cards` repository
   - Update code to fetch from CDN or separate endpoint
   - Immediate 33% size reduction

2. **Move Documentation Site** (9.4M → 0M)
   - Create `unigraph-docs` repository
   - Deploy to GitHub Pages or Netlify
   - Update documentation links

### **Phase 2: Medium Impact**

3. **Move Demo Images** (7.7M → 0M)
   - Create `unigraph-demo-assets` repository
   - Implement lazy loading for demo assets
   - Load only when demo is accessed

4. **Move Large Data Files** (3M → 0M)
   - Create `unigraph-data` repository
   - Implement data fetching from external source
   - Add loading states for data-dependent features

### **Phase 3: Optimization**

5. **Optimize Remaining Assets**
   - Compress remaining images
   - Remove duplicate files
   - Implement proper asset optimization

## 📈 **Expected Results**

| Current Size | After Phase 1 | After Phase 2 | After Phase 3 |
| ------------ | ------------- | ------------- | ------------- |
| 51.5M        | 34.5M         | 26.8M         | ~20M          |
| 100%         | 67%           | 52%           | 39%           |

## 🔧 **Implementation Strategy**

### **For Story Cards:**

```typescript
// Instead of importing directly
import storyCardAssets from "./storyCardFiles/...";

// Use dynamic loading
const loadStoryCard = async (cardId: string) => {
  const response = await fetch(
    `https://cdn.unigraph.dev/story-cards/${cardId}.json`
  );
  return response.json();
};
```

### **For Documentation:**

```typescript
// Update documentation links to point to separate site
const DOCS_BASE_URL = "https://docs.unigraph.dev";
```

### **For Demo Assets:**

```typescript
// Lazy load demo assets
const loadDemoAsset = async (assetPath: string) => {
  const response = await fetch(`https://demo-assets.unigraph.dev/${assetPath}`);
  return response.blob();
};
```

## ⚠️ **Considerations**

1. **Build Process**: Update CI/CD to handle external assets
2. **Offline Support**: Consider which assets are needed offline
3. **CDN Setup**: Configure proper CDN for external assets
4. **Fallback Strategy**: Handle cases where external assets fail to load
5. **Versioning**: Ensure external assets are properly versioned

## 🎯 **Priority Order**

1. **Story Card Files** (17M) - Highest impact, concept art
2. **Documentation Site** (9.4M) - Built assets, can be regenerated
3. **Demo Images** (7.7M) - Not essential for core functionality
4. **Large Data Files** (3M) - Can be fetched on-demand
5. **Remaining Optimization** - Compress and deduplicate

This approach would reduce the repository size by approximately **50-60%** while maintaining all functionality through dynamic loading.
