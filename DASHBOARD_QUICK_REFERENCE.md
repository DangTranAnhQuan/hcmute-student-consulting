# 🚀 Dashboard Quick Reference Guide

## File Locations & Imports

### **Redux Related**
```javascript
// Slice - state management
import dashboardSlice from "src/redux/dashboardSlice";
import { 
  markAsRead, 
  clearNotification,
  setNewsCategory,
  setSearchQuery 
} from "src/redux/dashboardSlice";

// Using in component
const { notifications } = useSelector(state => state.dashboard);
const dispatch = useDispatch();
```

### **Components**
```javascript
// Dashboard page
import DashboardPage from "src/pages/DashboardPage";

// Dashboard widgets
import {
  NotificationWidget,
  NewsWidget,
  ScheduleWidget,
  ArticleWidget,
  DocumentWidget,
  EventWidget
} from "src/components/dashboard/DashboardWidgets";

// Dashboard header
import DashboardHeader from "src/components/dashboard/DashboardHeader";

// Common UI components
import {
  Badge,
  Chip,
  Accordion,
  Modal,
  Pagination,
  Tag
} from "src/components/common/CommonUI";
```

### **Mock Data**
```javascript
import {
  mockNotifications,
  mockFeaturedNews,
  mockSchedules,
  mockPopularArticles,
  mockDocuments,
  mockEvents,
  mockCategories,
  mockUserData
} from "src/utils/mockData";
```

---

## Component Props & Usage

### **NotificationWidget**
```jsx
<NotificationWidget />

// Manages internally:
// - notifications from Redux
// - markAsRead(id)
// - clearNotification(id)
```

### **NewsWidget**
```jsx
<NewsWidget />

// Uses:
// - featuredNews from Redux
// - Links to `/detail/news/:id`
```

### **ScheduleWidget**
```jsx
<ScheduleWidget />

// Uses:
// - schedules from Redux
// - Links to `/book-counselor`
```

### **ArticleWidget**
```jsx
<ArticleWidget />

// Uses:
// - populerArticles from Redux (note: typo)
// - Links to `/detail/article/:id`
```

### **DocumentWidget**
```jsx
<DocumentWidget />

// Uses:
// - documents from Redux
// - Links to `/download/:id`
```

### **EventWidget**
```jsx
<EventWidget />

// Uses:
// - events from Redux
// - Links to `/detail/event/:id`
```

### **DashboardHeader**
```jsx
<DashboardHeader />

// Uses:
// - user from auth Redux
// - notifications from dashboard Redux
// - populerArticles from dashboard Redux
// - Mock user data as fallback
```

---

## Common UI Components

### **Badge**
```jsx
<Badge variant="primary|secondary|success|warning|danger" size="sm|md|lg">
  Text
</Badge>
```

### **Chip**
```jsx
<Chip 
  label="Tag Name" 
  onClose={() => handleClose()} 
  variant="primary|secondary|success"
/>
```

### **Accordion**
```jsx
<Accordion items={[
  { title: "Question 1", content: "Answer 1" },
  { title: "Question 2", content: "Answer 2" }
]} />
```

### **Modal**
```jsx
<Modal 
  isOpen={isOpen} 
  onClose={() => setIsOpen(false)} 
  title="Modal Title"
  size="sm|md|lg|xl"
>
  Modal content here
</Modal>
```

### **Pagination**
```jsx
<Pagination 
  currentPage={1} 
  totalPages={10} 
  onPageChange={(page) => setPage(page)}
/>
```

### **Tag**
```jsx
<Tag 
  label="Label" 
  variant="default|primary|success|warning|danger"
  closable
  onClose={() => {}}
/>
```

---

## Redux State Structure

```javascript
dashboard: {
  // Data
  notifications: Notification[],
  featuredNews: News[],
  schedules: Schedule[],
  populerArticles: Article[],
  documents: Document[],
  events: Event[],

  // UI State
  isLoading: boolean,
  error: string | null,

  // Filters
  filters: {
    newsCategory: string,
    searchQuery: string
  }
}
```

### **Data Type Definitions**

**Notification**
```javascript
{
  id: number,
  type: "info|success|warning|error",
  title: string,
  message: string,
  timestamp: Date,
  read: boolean
}
```

**News / Event**
```javascript
{
  id: number,
  title: string,
  excerpt: string,
  category: string,
  image: string,
  views: number,
  date: Date
}
```

**Schedule**
```javascript
{
  id: number,
  title: string,
  counselor: string,
  time: string,
  date: string (YYYY-MM-DD),
  format: "Online|Offline",
  status: "confirmed|pending"
}
```

**Article**
```javascript
{
  id: number,
  title: string,
  author: string,
  category: string,
  views: number,
  saves: number,
  readTime: string,
  image: string
}
```

**Document**
```javascript
{
  id: number,
  name: string,
  type: string (PDF|DOCX|XLS|PPT|ZIP),
  size: string,
  date: Date,
  downloads: number
}
```

**UserData**
```javascript
{
  id: string,
  username: string,
  fullName: string,
  email: string,
  phone: string,
  avatar: string,
  faculty: string,
  studentId: string,
  savedCount: number,
  articlesRead: number
}
```

---

## Common Tasks

### **Add a New Widget**

1. Create component in `src/components/dashboard/`
2. Import Redux selector: `const { data } = useSelector(s => s.dashboard)`
3. Add to grid in `DashboardPage.jsx`

### **Modify Mock Data**

```javascript
// Edit src/utils/mockData.js
export const mockNotifications = [
  // Your data
];
```

### **Add New Redux Actions**

```javascript
// In dashboardSlice.js
reducers: {
  newAction: (state, action) => {
    // mutation code
  }
}

// Export
export const { newAction } = dashboardSlice.actions;
```

### **Use Dashboard Data in Other Components**

```javascript
import { useSelector } from "react-redux";

// In component
const { notifications, featuredNews } = useSelector(s => s.dashboard);
```

### **Change Dashboard Layout**

Edit the grid in `DashboardPage.jsx`:

```jsx
// Currently: lg:col-span-2 (left), default (right)
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Adjust cols, gap, or structure */}
</div>
```

### **Add New Route Link**

In widget, add link:
```jsx
<a href="/your-page" className="hover:text-primary">
  Link Text
</a>
```

---

## Responsive Classes Used

| Class | Breakpoint | Meaning |
|-------|-----------|---------|
| `sm:` | 640px | Small devices |
| `md:` | 1024px | Medium devices |
| `lg:` | 1280px | Large devices |
| `max-w-7xl` | Max width | Container width |
| `grid-cols-1` | Full width | Single column |
| `md:grid-cols-2` | 2 columns on tablet |
| `lg:grid-cols-3` | 3 columns on desktop |

---

## Color Scheme

| Color | Value | Usage |
|-------|-------|-------|
| `primary` | #3b82f6 | Primary actions, links |
| `primary-dark` | #1e40af | Hover states |
| `secondary` | #10b981 | Success, secondary actions |
| `danger` | #ef4444 | Errors, destructive actions |
| `warning` | #f59e0b | Warnings |
| `success` | #10b981 | Success messages |

---

## Tailwind Classes Quick Ref

### **Spacing**
```
p-4          padding all sides
px-4 py-2    padding horizontal & vertical
m-4          margin
mb-8         margin bottom
gap-6        grid/flex gap
```

### **Text**
```
text-lg      large text
font-bold    bold text
text-gray-900 dark gray color
text-gray-600 medium gray color
line-clamp-1 text truncation (1 line)
```

### **Display**
```
flex         flexbox
grid         css grid
hidden       display none
md:flex      flex on medium & up
lg:col-span-2 span 2 columns on lg
```

### **Effects**
```
shadow-md    medium shadow
rounded-lg   rounded corners
hover:bg-gray-50 hover effect
transition   smooth transitions
opacity-50   50% transparency
```

---

## Common Patterns

### **Conditional Rendering**
```jsx
{notifications.length === 0 ? (
  <p>No notifications</p>
) : (
  <div>Show notifications</div>
)}
```

### **Array Mapping**
```jsx
{notifications.map((notif) => (
  <div key={notif.id}>
    {notif.title}
  </div>
))}
```

### **Event Handling**
```jsx
<button onClick={() => dispatch(markAsRead(id))}>
  Mark as Read
</button>
```

### **Conditional Classes**
```jsx
<div className={`p-3 ${notif.read ? 'bg-white' : 'bg-blue-50'}`}>
  Content
</div>
```

---

## Browser DevTools

### **Redux DevTools**
1. Install Redux DevTools Extension
2. Open DevTools (F12)
3. Go to Redux tab
4. View state tree
5. Monitor actions

### **React DevTools**
1. Install React DevTools Extension
2. Open DevTools (F12)
3. Go to Components tab
4. Inspect component props
5. Check hook state

---

## Performance Tips

✅ **Do:**
- Use React.memo for expensive widgets
- Memoize selectors
- Use CSS grid/flexbox for layouts
- Lazy load images
- Optimize re-renders

❌ **Don't:**
- Create new objects in render
- Inline functions in JSX
- Overuse Redux for local state
- Heavy computations in render

---

## Debugging Checklist

- [ ] Check browser console for errors
- [ ] Verify Redux DevTools state
- [ ] Check Network tab (API calls)
- [ ] Inspect elements with DevTools
- [ ] Test responsive layout
- [ ] Verify all imports are correct
- [ ] Check mock data structure
- [ ] Test user authentication

---

## Links & Resources

### **In Project**
- Dashboard: `/dashboard`
- Profile: `/profile`
- Home: `/`

### **Documentation**
- `DASHBOARD_DOCUMENTATION.md` - Full docs
- `DASHBOARD_IMPLEMENTATION_SUMMARY.md` - Summary
- This file - Quick reference

### **External**
- [Tailwind CSS](https://tailwindcss.com)
- [Redux Toolkit](https://redux-toolkit.js.org)
- [React](https://react.dev)
- [React Router](https://reactrouter.com)

---

## Quick Commands

```bash
# Start development
npm start

# Build for production
npm build

# Run tests
npm test

# Open in browser
# http://localhost:3000/dashboard
```

---

**Quick Reference Version:** 1.0
**Last Updated:** May 17, 2026
**Status:** ✅ Ready for Use

