# Web Frontend Görev Dağılımı

**Web Frontend Adresi:** [frontend.yazmuh.com](https://frontend.yazmuh.com)

Bu dokümanda, web uygulamasının kullanıcı arayüzü (UI) ve kullanıcı deneyimi (UX) görevleri listelenmektedir. Her grup üyesi, kendisine atanan sayfaların tasarımı, implementasyonu ve kullanıcı etkileşimlerinden sorumludur.

---

## Grup Üyelerinin Web Frontend Görevleri

1. [Ali Tutar'ın Web Frontend Görevleri](Ali-Tutar/Ali-Tutar-Web-Frontend-Gorevleri.md)
2. [Grup Üyesi 2'nin Web Frontend Görevleri](Grup-Uyesi-2/Grup-Uyesi-2-Frontend-Gorevleri.md)
3. [Grup Üyesi 3'ün Web Frontend Görevleri](Grup-Uyesi-3/Grup-Uyesi-3-Frontend-Gorevleri.md)
4. [Grup Üyesi 4'ün Web Frontend Görevleri](Grup-Uyesi-4/Grup-Uyesi-4-Frontend-Gorevleri.md)
5. [Grup Üyesi 5'in Web Frontend Görevleri](Grup-Uyesi-5/Grup-Uyesi-5-Frontend-Gorevleri.md)
6. [Grup Üyesi 6'nın Web Frontend Görevleri](Grup-Uyesi-6/Grup-Uyesi-6-Frontend-Gorevleri.md)

---

## Genel Web Frontend Prensipleri

### 1. Responsive Tasarım
- **Mobile-First Approach:** Önce mobil tasarım, sonra desktop
- **Breakpoints:** 
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px
- **Flexible Layouts:** CSS Grid ve Flexbox kullanımı
- **Responsive Images:** srcset ve sizes attributes
- **Touch-Friendly:** Minimum 44x44px touch targets

### 2. Tasarım Sistemi
- **CSS Framework:** Bootstrap, Tailwind CSS, Material-UI, veya custom
- **Renk Paleti:** Tutarlı renk kullanımı (CSS variables)
- **Tipografi:** Web-safe fonts veya web fonts (Google Fonts)
- **Spacing:** Tutarlı padding ve margin değerleri (8px grid sistemi)
- **Iconography:** Icon library (Font Awesome, Material Icons, Heroicons)
- **Component Library:** Reusable UI components

### 3. Performans Optimizasyonu
- **Code Splitting:** Route-based ve component-based splitting
- **Lazy Loading:** Images, components, ve routes
- **Minification:** CSS ve JavaScript minification
- **Compression:** Gzip/Brotli compression
- **Caching:** Browser caching, service worker (PWA)
- **Bundle Size:** Tree shaking, dead code elimination

### 4. SEO (Search Engine Optimization)
- **Meta Tags:** Title, description, keywords
- **Structured Data:** JSON-LD schema markup
- **Semantic HTML:** Proper HTML5 semantic elements
- **Alt Text:** Image alt attributes
- **Sitemap:** XML sitemap generation
- **Robots.txt:** Search engine crawling rules

### 5. Erişilebilirlik (Accessibility)
- **WCAG 2.1 AA Compliance:** Minimum accessibility standard
- **Keyboard Navigation:** Tab order, focus management
- **Screen Reader Support:** ARIA labels, roles, landmarks
- **Color Contrast:** Minimum 4.5:1 ratio
- **Focus Indicators:** Visible focus states
- **Skip Links:** Skip to main content

### 6. Browser Compatibility
- **Modern Browsers:** Chrome, Firefox, Safari, Edge (son 2 versiyon)
- **Polyfills:** ES6+ features için gerekli polyfills
- **CSS Prefixes:** Autoprefixer kullanımı
- **Feature Detection:** Modernizr veya native feature detection
- **Graceful Degradation:** Eski tarayıcılar için fallback

### 7. State Management
- **Global State:** Redux, Zustand, Context API (React), Vuex/Pinia (Vue)
- **Local State:** Component state, hooks
- **Server State:** React Query, SWR, Apollo Client
- **Form State:** React Hook Form, Formik, React Final Form

### 8. Routing
- **Client-Side Routing:** React Router, Vue Router, Angular Router
- **Deep Linking:** URL-based navigation
- **Protected Routes:** Authentication guards
- **404 Handling:** Custom 404 page
- **History Management:** Browser history API

### 9. API Entegrasyonu
- **HTTP Client:** Axios, Fetch API, ky
- **Request Interceptors:** Token injection, error handling
- **Response Interceptors:** Error handling, token refresh
- **Error Handling:** Centralized error handling
- **Loading States:** Global loading indicator

### 10. Testing
- **Unit Tests:** Jest, Vitest, Mocha
- **Integration Tests:** React Testing Library, Vue Test Utils
- **E2E Tests:** Cypress, Playwright, Selenium
- **Visual Regression:** Percy, Chromatic
- **Accessibility Tests:** axe-core, Lighthouse

### 11. Build ve Deployment
- **Build Tool:** Webpack, Vite, Parcel, esbuild
- **Module Bundler:** ES modules, CommonJS
- **Environment Variables:** .env files
- **CI/CD:** GitHub Actions, GitLab CI, Jenkins
- **Hosting:** Vercel, Netlify, AWS, Azure