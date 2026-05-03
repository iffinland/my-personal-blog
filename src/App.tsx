import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './layout/Layout';
import HomePage from './features/blog/pages/HomePage';
import GuestbookPage from './features/guestbook/pages/GuestbookPage';
import GalleryPage from './features/gallery/pages/GalleryPage';
import VideoPage from './features/video/pages/VideoPage';

const App = () => (
  <BrowserRouter>
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/guestbook" element={<GuestbookPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/videos" element={<VideoPage />} />
      </Routes>
    </Layout>
  </BrowserRouter>
);

export default App;
