## Prompt 1
This project is already initialized with Vite and React. Use functional components only. Do not install any UI library. Do not add any movie functionality yet.

**Result:** Confirmed current setup (Vite + React 19 + TypeScript, react-router-dom installed but not wired, no UI library). Agreed to follow constraints. Asked what to build next.

## Prompt 2
Remove all default Vite content, images, styles, and demonstration code. Leave a minimal working React application with an empty App component. Do not create any additional components or functionality.

**Result:** Removed demo UI from App.tsx, App.css, index.css, vite/react SVG assets, and favicon link. Left src/App.tsx as an empty functional component, src/main.tsx mounting it in StrictMode.

## Prompt 3
Create a reusable Header component. The Header should contain: a Home navigation link, a Favourites navigation link, a search input, a Search button. Use React Router links for navigation. Only create and display the Header. Do not create the Home or Favourites screens yet. Do not connect the search input to any functionality.

**Result:** Created src/components/Header.tsx with Home (Link to /) and Favourites (Link to /favourites) nav links, an unwired search input, and an unwired Search button. Wrapped App.tsx in BrowserRouter and rendered Header. Added minimal layout styles in Header.css. No routes created yet.

## Prompt 4
Please can you add styling to the header.

**Result:** Added CSS styling to Header.css — layout, spacing, and visual polish applied to the nav links, search input, and search button. No functional changes.

## Prompt 5
Create the empty MVVM file structure for the Home screen. Create: src/pages/Home/HomeModel.ts, src/pages/Home/useHomeViewModel.ts, src/pages/Home/HomeView.tsx. Requirements: HomeModel.ts will later contain Home-specific data and business logic. useHomeViewModel.ts will later contain React state and actions. HomeView.tsx will later render the Home interface. Create only minimal placeholder exports so the application can compile. Do not add API requests, React state, or movie UI.

**Result:** Created src/pages/Home/HomeModel.ts (empty export const HomeModel = {}), useHomeViewModel.ts (empty function useHomeViewModel() { return {} }), and HomeView.tsx (empty component returning null). No API calls, state, or movie UI. Files not wired into routing yet — app still renders only the Header.

## Prompt 6
Create the empty MVVM file structure for the Favourites screen. Create: src/pages/Favourites/FavouritesModel.ts, src/pages/Favourites/useFavouritesViewModel.ts, src/pages/Favourites/FavouritesView.tsx. Create only minimal placeholder exports so the application can compile. Do not add Firebase, state, movie cards, or other functionality.

**Result:** Created src/pages/Favourites/FavouritesModel.ts (empty export const FavouritesModel = {}), useFavouritesViewModel.ts (empty function useFavouritesViewModel() { return {} }), and FavouritesView.tsx (empty component returning null). No Firebase, state, or movie cards. Not wired into routing yet.

## Prompt 7
Create a services folder and an empty OMDb movie service file: src/services/omdbMovieService.ts. Add a short comment explaining that this file will contain communication with the OMDb API. Do not implement the API request yet.

**Result:** Created src/services/omdbMovieService.ts with a comment noting it will handle OMDb API communication. No API logic added yet.

## Prompt 8
Implement the OMDb movie search request inside src/services/omdbMovieService.ts. Create an exported async function: searchMovies(query: string): Promise<Movie[]>. Requirements: use the OMDb API (API_URL = "https://www.omdbapi.com/"), read the API key from VITE_OMDB_API_KEY, encode the search query, use the Movie and OmdbSearchResponse types, return the Search array as Movie[], throw a readable error when the HTTP request fails, throw a readable error when OMDb returns Response: "False". Do not use React hooks. Do not use useEffect. Do not manage loading, error, or component state.

**Result:** Created src/types/movie.ts with Movie and OmdbSearchResponse types. Implemented searchMovies(query) in omdbMovieService.ts — calls OMDb with encoded query and API key from VITE_OMDB_API_KEY, returns data.Search as Movie[] (or [] if missing), throws a readable error on HTTP failure, throws OMDb's Error message when Response === "False". No React hooks or component state used.