import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ShowsProvider } from "./context/ShowsContext";
import { HomePage } from "./pages/HomePage";
import { BrowsePage } from "./pages/BrowsePage";
import { ShowPage } from "./pages/ShowPage";
import { WatchPage } from "./pages/WatchPage";
import { SearchPage } from "./pages/SearchPage";
import { TrailerPage } from "./pages/TrailerPage";
import { ClipPage } from "./pages/ClipPage";

export default function App() {
  return (
    <ShowsProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="browse" element={<BrowsePage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="show/:id" element={<ShowPage />} />
            <Route path="watch/:showId/:episode" element={<WatchPage />} />
            <Route path="trailer/:id" element={<TrailerPage />} />
            <Route path="clip/:id" element={<ClipPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ShowsProvider>
  );
}
