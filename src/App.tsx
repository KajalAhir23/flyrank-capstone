import { Link, Route, Routes } from "react-router-dom";
import { SettingsPage } from "./pages/Settings";

function HomePage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        FlyRank Capstone
      </h1>
      <p className="mt-3 max-w-md text-slate-600">
        Frontend project with a validated settings form built using React Hook Form
        and Zod.
      </p>
      <Link
        to="/settings"
        className="mt-6 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500"
      >
        Open settings
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-100">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="text-sm font-semibold text-slate-900">
            FlyRank
          </Link>
          <div className="flex gap-4 text-sm">
            <Link to="/" className="text-slate-600 hover:text-slate-900">
              Home
            </Link>
            <Link to="/settings" className="text-slate-600 hover:text-slate-900">
              Settings
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
}
