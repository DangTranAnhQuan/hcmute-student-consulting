# Phase 1 — UI & Mock Data Summary

Date: 2026-05-17

This document summarizes all frontend work completed in Phase 1 of the Student Consulting Website project. It covers the tech stack, architecture, implemented modules, state & mock data strategy, and recommendations for the next phase (backend integration and security hardening).

---

## 1. Project overview

- Purpose: Deliver a polished, production-like frontend UI (React + Tailwind) with realistic mock data and simulated CRUD flows so the backend team can integrate APIs in Phase 2.
- Main technologies used in Phase 1:
  - React 18 (functional components, hooks)
  - Redux Toolkit for predictable global state
  - React Router v6 for routing
  - Tailwind CSS v3 for styling
  - @tailwindcss/typography plugin (for `prose` styles)
  - react-quill as a lightweight rich text editor for Admin CMS
  - Axios (already present) for future API calls

---

## 2. Architecture & folder structure (high level)

Root: `frontend/`

Key files and folders (under `frontend/src`):

- `src/components/` — reusable UI components and feature folders:
  - `common/` — Common small primitives (Badge, Chip, ConfirmModal, CommonUI)
  - `dashboard/` — Dashboard widgets (NotificationWidget, NewsWidget, ScheduleWidget, DocumentWidget, EventWidget)
  - `news/` — News & article cards, filter controls
  - `detail/` — Universal detail page components (banner, meta, content, related posts, rating/comments)
  - `forum/` — Q&A components (QuestionCard, ForumThread, CreateThreadModal, ReplyForm, AnswerThread)
  - `admin/` — Admin CMS components (AdminTabs, AdminToolbar, AdminDataTable, AdminFormModal using react-quill)
  - `faq/` — FAQ accordion, search and library list

- `src/pages/` — Page containers (DashboardPage, NewsPage, ArticlesPage, DetailPage, SearchPage, FAQPage, AdminPage, ForumPage, Home, Login, Register, Profile, etc.)

- `src/redux/` — Redux slices and store
  - `authSlice.js` (existing)
  - `dashboardSlice.js`
  - `newsSlice.js`
  - `searchSlice.js`
  - `faqSlice.js`
  - `adminSlice.js` (mock CMS CRUD)
  - `forumSlice.js` (threads, replies, upvote, solved flag)
  - `store.js` (configureStore to combine slices)

- `src/services/` — lightweight service placeholders for future API integration (e.g., `forumService.js`, `api.js`).

- `src/utils/` — utilities and mock data
  - `mockData.js` — centralized mock data for news, articles, counselors, schedules, notifications, CMS data and forum threads. Contains helper functions (getDetailItem, getRelatedItems, applyAdvancedFilters, getMockComments).
  - `helpers.js`, `storage.js`, `ProtectedRoute.jsx`.

- `src/App.jsx` — central routes (including `/dashboard`, `/news`, `/articles`, `/detail/:type/:id`, `/search`, `/faq`, `/admin/cms`, `/forum`).

---

## 3. Implemented modules (checklist)

All items below were implemented in Phase 1 with Tailwind-first styling and Redux state backed by `mockData.js`.

- Member Dashboard (Post-login):
  - `src/pages/DashboardPage.jsx` and `src/components/dashboard/*`
  - Widgets: Notifications, Featured News, Upcoming Counseling Schedules, Popular Articles, Useful Documents, Events
  - Responsive grid layout, quick actions, CTA links to search & forum

- News & Article Listings
  - `src/pages/NewsPage.jsx`, `src/components/news/*`
  - Category filter, grid/list view toggle, search and sort controls

- Universal Detail Pages
  - `src/pages/DetailPage.jsx`, `src/components/detail/DetailSections.jsx`
  - Banner, meta, rich-content area (now supports HTML body saved by Quill), related posts, rating & comments
  - Rendering uses Tailwind Typography (`prose`) for excellent reading experience

- Advanced Search & Filtering
  - `src/pages/SearchPage.jsx`, `src/components/search/*`, `src/redux/searchSlice.js`
  - Filter sidebar + chips, supports Topic, Faculty, Content Type, Publish Time, Popularity, Counseling Format, Appointment Status
  - `applyAdvancedFilters` helper in `mockData.js` applies filters against `mockAdvancedSearchItems`

- Q&A Forum
  - `src/pages/ForumPage.jsx`, `src/components/forum/*`, `src/redux/forumSlice.js`
  - Replace `window.prompt` flows with `CreateThreadModal` (Title, Details, Tag picker)
  - Thread list, thread detail view, replies, upvote, mark solved, delete (all simulated in Redux)
  - Thread bodies and replies use `prose` for readable multi-paragraph content

- Admin CMS
  - `src/pages/AdminPage.jsx`, `src/components/admin/*`, `src/redux/adminSlice.js`
  - CRUD UI (Admin tabs, toolbar, data table, create/edit modal)
  - Admin article editor uses `react-quill` for content (`body` field saved as HTML) — mock CRUD updates `mockCMSData` in Redux slice
  - Mock toolbar replaced by real `react-quill` instance with a basic toolbar

- FAQ & Library
  - `src/pages/FAQPage.jsx`, `src/components/faq/*`
  - Accordion UI, search, categories, and library templates for download simulation

---

## 4. State & data management (mock strategy)

- All runtime data is driven from `src/utils/mockData.js`. This file centralizes:
  - `mockAllNews`, `mockFeaturedNews`, `mockSchedules`, `mockPopularArticles`, `mockDocuments`, `mockEvents` and more.
  - CMS mock store `mockCMSData` for articles, topics, faqs, schedules, and notifications.
  - `mockForumThreads` for forum threads and replies.
  - Helper functions `getDetailItem(type, id)`, `getRelatedItems(type, id)`, `getMockComments(id)`, and `applyAdvancedFilters(items, filters)` to simulate server behavior.

- Each feature uses a thin Redux slice to manage UI state and simulate CRUD behavior on the mock data. Examples:
  - `adminSlice.js` — create/update/delete operations that operate on `state.data` (which is initialized from `mockCMSData`). New items receive generated ids and timestamps.
  - `forumSlice.js` — createThread / createReply / upvoteThread / toggleSolved / deleteThread operate in-memory and update `state.threads`.
  - `newsSlice.js`, `searchSlice.js`, `faqSlice.js`, `dashboardSlice.js` — manage filters, selections, and derived lists.

- This approach allows the frontend to behave exactly like a networked app (routing, CRUD, filtering) while the backend is not yet connected.

---

## 5. Security, technical debt & next-phase considerations

The UI & Mock Data phase focused on delivering a production-quality frontend. The following items are recommended for Phase 2 (backend integration) or near-term hardening:

1. Replace mock data with REST API endpoints:
   - Implement services in `src/services/*` to fetch and mutate data (e.g., `newsService`, `adminService`, `forumService`).
   - Convert Redux slices to use async thunks (RTK `createAsyncThunk`) to call server APIs and persist changes.

2. Rich-text sanitization and XSS protection:
   - Currently `react-quill` saves HTML and the app renders it with `dangerouslySetInnerHTML` (for admin articles and forum posts). Before production, sanitize HTML using a library such as `dompurify` on the server (preferred) and/or client-side prior to rendering.

3. Authentication & authorization:
   - The app uses a protected-route pattern; integrate real JWT-based auth and session management in Phase 2. Ensure admin operations are properly authorized server-side.

4. Image uploads for editor and forum:
   - Integrate editor image upload handlers (Quill image handler) and server-side storage (S3, local storage, or other). For now Quill accepts image-by-URL.

5. Input validation & rate-limiting:
   - Add form validation, server-side checks, and rate-limiting for destructive or high-frequency endpoints.

6. Accessibility, testing and performance:
   - Add unit and component tests (Jest + React Testing Library) and e2e tests (Cypress). Audit accessibility (aria attributes, keyboard navigation) and tune performance (lazy load images, code-splitting, bundle analysis).

7. Security policy & sanitization checklist:
   - Sanitize rich text inputs (DOMPurify)
   - CORS, CSRF controls for API
   - Input validation on server

---

## 6. How to run locally (quick start)

1. Open a terminal and go to the `frontend` folder:
```powershell
Set-Location "D:\Nam3_HK2\Project\hcmute-student-consulting\frontend"
```
2. Install dependencies (new dependencies include `react-quill` and `@tailwindcss/typography`):
```powershell
npm install
```
3. Run the dev server:
```powershell
npm start
```
4. Useful routes to test:
  - `/dashboard` — Member dashboard
  - `/news` and `/articles` — listings
  - `/detail/:type/:id` — universal detail page (type=news|article|event|counselor)
  - `/search` — advanced search
  - `/faq` — FAQ and library
  - `/forum` — Q&A forum (protected route)
  - `/admin/cms` — Admin CMS (protected route)

---

## 7. Major files added/modified (quick reference)

- `src/utils/mockData.js` — center of mock data and helper functions
- `src/redux/*.js` — slices: `adminSlice.js`, `forumSlice.js`, `newsSlice.js`, `searchSlice.js`, `faqSlice.js`, `dashboardSlice.js`, and `store.js`
- `src/components/admin/*` — Admin UI and `AdminFormModal.jsx` (react-quill integration)
- `src/components/forum/*` — forum UI and `CreateThreadModal.jsx` (modal form)
- `src/components/detail/DetailSections.jsx` — now renders rich `body` HTML with `prose`
- `src/components/faq/FAQAccordion.jsx` — FAQ answers use `prose`
- `src/App.jsx` — central routes updated
- `tailwind.config.js` — added `@tailwindcss/typography`, container defaults, and modal animation
- `package.json` — added `react-quill`, `@tailwindcss/typography`

---

If you want, I can now:

- (A) Add `DOMPurify` usage in the frontend as an extra sanitation step for previews (recommended during integration), and/or
- (B) Implement `createAsyncThunk` wrappers for the slices to prepare for API integration.

Otherwise, Phase 1 (UI & Mock Data) is complete and documented here.

---

End of Phase 1 UI Summary

