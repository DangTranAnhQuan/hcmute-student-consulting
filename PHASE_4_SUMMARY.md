# Phase 4 - Advanced Search & Filter System

## Scope delivered

- Advanced search page: `frontend/src/pages/SearchPage.jsx`
- Dynamic filter sidebar:
  - Topic
  - Faculty
  - Content Type
  - Publish Time
  - Popularity
  - Counseling Format
  - Appointment Status
- Active filter chips with one-click remove
- Search results list linked to detail pages
- Redux state management via `searchSlice`

## Files added

- `frontend/src/redux/searchSlice.js`
- `frontend/src/components/search/SearchBar.jsx`
- `frontend/src/components/search/FilterSidebar.jsx`
- `frontend/src/components/search/FilterChips.jsx`
- `frontend/src/components/search/SearchResults.jsx`
- `frontend/src/pages/SearchPage.jsx`

## Files updated

- `frontend/src/utils/mockData.js`
- `frontend/src/redux/store.js`
- `frontend/src/App.jsx`

## Data model used (mock)

`mockAdvancedSearchItems` includes:

- `topic`
- `faculty`
- `contentType`
- `publishTime`
- `popularity`
- `counselingFormat`
- `appointmentStatus`
- `type` + `refId` for detail routing

## How to verify

- Open `/search`
- Type keyword in the search box
- Combine multiple filters in sidebar
- Remove active filters from chips
- Open a result to `/detail/:type/:id`

## Notes

- No new dependencies are required.
- Build execution from integrated terminal is currently blocked by IDE terminal limitation in this environment.
- Static error validation on edited files returns no errors.

