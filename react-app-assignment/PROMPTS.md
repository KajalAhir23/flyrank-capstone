# PROMPTS.md

This file logs every prompt used to build this React movie app, in order, along with a short note on the result. Two AI tools were used during development: Cursor (until its usage quota was reached) and GitHub Copilot Chat in VS Code (to continue afterward).

---

## Prompt 1 (Cursor)
This project is already initialized with Vite and React. Use functional components only. Do not install any UI library. Do not add any movie functionality yet.

**Result:** Confirmed current setup (Vite + React 19 + TypeScript, react-router-dom installed but not wired, no UI library). Agreed to follow constraints. Asked what to build next.

## Prompt 2 (Cursor)
Remove all default Vite content, images, styles, and demonstration code. Leave a minimal working React application with an empty App component. Do not create any additional components or functionality.

**Result:** Removed demo UI from App.tsx, App.css, index.css, vite/react SVG assets, and favicon link. Left src/App.tsx as an empty functional component, src/main.tsx mounting it in StrictMode.

## Prompt 3 (Cursor)
Create a reusable Header component. The Header should contain: a Home navigation link, a Favourites navigation link, a search input, a Search button. Use React Router links for navigation. Only create and display the Header. Do not create the Home or Favourites screens yet. Do not connect the search input to any functionality.

**Result:** Created src/components/Header.tsx with Home (Link to /) and Favourites (Link to /favourites) nav links, an unwired search input, and an unwired Search button. Wrapped App.tsx in BrowserRouter and rendered Header. Added minimal layout styles in Header.css. No routes created yet.

## Prompt 4 (Cursor)
Please can you add styling to the header.

**Result:** Added CSS styling to Header.css — layout, spacing, and visual polish applied to the nav links, search input, and search button.

## Prompt 5 (Cursor)
Create the empty MVVM file structure for the Home screen. Create: src/pages/Home/HomeModel.ts, src/pages/Home/useHomeViewModel.ts, src/pages/Home/HomeView.tsx. Requirements: HomeModel.ts will later contain Home-specific data and business logic. useHomeViewModel.ts will later contain React state and actions. HomeView.tsx will later render the Home interface. Create only minimal placeholder exports so the application can compile. Do not add API requests, React state, or movie UI.

**Result:** Created src/pages/Home/HomeModel.ts (empty export const HomeModel = {}), useHomeViewModel.ts (empty function useHomeViewModel() { return {} }), and HomeView.tsx (empty component returning null). No API calls, state, or movie UI. Files not wired into routing yet — app still renders only the Header.

## Prompt 6 (Cursor)
Create the empty MVVM file structure for the Favourites screen. Create: src/pages/Favourites/FavouritesModel.ts, src/pages/Favourites/useFavouritesViewModel.ts, src/pages/Favourites/FavouritesView.tsx. Create only minimal placeholder exports so the application can compile. Do not add Firebase, state, movie cards, or other functionality.

**Result:** Created src/pages/Favourites/FavouritesModel.ts (empty export const FavouritesModel = {}), useFavouritesViewModel.ts (empty function useFavouritesViewModel() { return {} }), and FavouritesView.tsx (empty component returning null). No Firebase, state, or movie cards. Not wired into routing yet.

## Prompt 7 (Cursor)
Create a services folder and an empty OMDb movie service file: src/services/omdbMovieService.ts. Add a short comment explaining that this file will contain communication with the OMDb API. Do not implement the API request yet.

**Result:** Created src/services/omdbMovieService.ts with a comment noting it will handle OMDb API communication. No API logic added yet.

## Prompt 8 (Cursor)
Implement the OMDb movie search request inside src/services/omdbMovieService.ts. Create an exported async function: searchMovies(query: string): Promise<Movie[]>. Requirements: use the OMDb API (API_URL = "https://www.omdbapi.com/"), read the API key from VITE_OMDB_API_KEY, encode the search query, use the Movie and OmdbSearchResponse types, return the Search array as Movie[], throw a readable error when the HTTP request fails, throw a readable error when OMDb returns Response: "False". Do not use React hooks. Do not use useEffect. Do not manage loading, error, or component state.

**Result:** Created src/types/movie.ts with Movie and OmdbSearchResponse types. Implemented searchMovies(query) in omdbMovieService.ts — calls OMDb with encoded query and API key from VITE_OMDB_API_KEY, returns data.Search as Movie[] (or [] if missing), throws a readable error on HTTP failure, throws OMDb's Error message when Response === "False". No React hooks or component state used.

**Bug encountered:** After scaffolding, the app failed to resolve `react-router-dom` at one point — fixed by ensuring the package was installed (`npm install react-router-dom`).

## Prompt 9 (Cursor)
Okay add console logs just to double check if it works.

**Result:** Added console logs inside omdbMovieService.ts and temporarily wired the Header's search button to trigger a real request, so results could be verified in the browser console.

**Bug encountered:** Initial verification failed because the `.env` file (containing VITE_OMDB_API_KEY) had been lost/removed during an earlier project re-scaffold (switching from JavaScript to TypeScript templates). Recreated `.env` with the API key and restarted the dev server to fix it.

**Tool switch:** Cursor's free usage quota was reached at this point ("paused until usage resets in 30 days"). Switched to GitHub Copilot Chat in VS Code to continue development.

## Prompt 10 (GitHub Copilot) — combined steps
Continue building this movie app following the existing MVVM architecture. Do the following steps in order:
1. Implement the Home model (HomeModel.ts) — getMovies(query) with trimming/validation, calling searchMovies, no hooks/state/fetch.
2. Implement useHomeViewModel.ts — manage query, movies, loading, error via useState; handleSearch() calls getMovies and updates state.
3. Implement HomeView.tsx — use useHomeViewModel, show loading/error, render movie list. Connect the Header's existing search input/button to trigger handleSearch instead of duplicating a search input.
4. Create initialMovies() inside HomeModel — fetch 20 random unique movies on load using a seeded keyword list, Promise.all, dedupe by imdbID, shuffle.
5. Create a reusable MovieCard component (poster, title, year, type, unconnected Favourite button). Update HomeView to render MovieCard via .map().
6. Create and configure Firebase (firebaseService.ts) — initialize using environment variables, export the database instance, no favourites save/load yet, no auth.

**Result:** Implemented full Home flow — HomeModel, useHomeViewModel, HomeView. Removed the duplicate search input from HomeView and connected it to the Header's existing input/button so search state is shared correctly (this was flagged as a correction: the AI's first draft would have duplicated the search input before this instruction). Implemented initialMovies() to load 20 random movies on first load. Created and styled MovieCard, replacing inline rendering in HomeView. Configured Firebase using environment variables from .env.

**Bug caught and fixed:** After searching for a movie, clicking "Home" did not reload the random movie list — it left the page blank instead of resetting to initialMovies(). This was identified through manual testing (not caught by the AI automatically) and fixed by ensuring the Home route re-triggers initialMovies() on navigation.

## Prompt 11 (GitHub Copilot)
Please add styling to the MovieCard component. It should look like a clean, modern movie poster card in a grid layout — poster image filling most of the card, title and year below it, a subtle hover effect, and the Favourite button positioned clearly (e.g. top-right corner overlay on the poster). Keep it consistent with the existing Header styling.

**Result:** Styled MovieCard with a grid layout, poster-focused design, hover effect, and an overlaid Favourite button consistent with the Header's visual style.

## Prompt 12 (GitHub Copilot) — combined Favourites steps
Continue building the Favourites feature for this movie app, following the existing MVVM architecture and Firebase setup already in place. Do the following in order:
1. Implement favourites persistence in firebaseService.ts — saveFavourite(movie), removeFavourite(imdbID), getFavourites() using Firestore, collection "favourites" keyed by imdbID.
2. Implement FavouritesModel.ts — loadFavourites(), addFavourite(movie), deleteFavourite(imdbID), wrapping the firebaseService calls.
3. Implement useFavouritesViewModel.ts — manage favourites, loading, error via useState; load favourites on mount; removeFromFavourites(imdbID).
4. Implement FavouritesView.tsx — use useFavouritesViewModel, show loading/error/empty states, render favourites via MovieCard in a grid, connect remove action.
5. Connect the Favourite button on MovieCard in HomeView to addFavourite, with visual indication when a movie is already favourited.
6. Ensure Home and Favourites nav links in the Header correctly route via React Router ("/" and "/favourites").

**Result:** Implemented full Favourites flow — Firestore persistence functions, FavouritesModel, useFavouritesViewModel, and FavouritesView with loading/error/empty states. Connected MovieCard's Favourite button on both Home and Favourites screens to save/remove favourites in Firebase, with visual state indication. Confirmed Home and Favourites routes navigate correctly via the Header links.

---

## Manual corrections made after reviewing AI-generated code
1. **Duplicate search input removed:** The first pass of HomeView would have included its own search input, duplicating the one already built into the Header. Caught this during review and explicitly instructed the AI to reuse the Header's existing input/button instead of creating a second one.
2. **Home navigation reload bug:** After performing a search, navigating back to Home left the page blank instead of reloading the random initial movie list. Found this through manual testing in the browser (not something the AI's own build process caught), then had it debugged and fixed.
3. **Missing `.env` file:** Lost the `.env` file (containing the OMDb API key) during a project re-scaffold from JavaScript to TypeScript. Diagnosed this manually when API calls silently failed, recreated the file, and restarted the dev server.
4. **Tool switch due to usage limits:** Hit Cursor's free-tier usage quota mid-build. Rather than stalling, switched to GitHub Copilot Chat in VS Code and continued the same prompt sequence, adapting remaining prompts into combined batches to work efficiently within the new tool's context.