import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import App from './App.jsx';
import { captureCampaign } from './lib/campaign';

// Keep the landing page's utm_* for inspection requests (no cookie).
captureCampaign();

// index.html carries default title, description and social tags for crawlers that do not
// run JavaScript. Each page sets its own through components/SEO.jsx, which React hoists into
// <head> without replacing the static ones: drop the defaults so a page has one of each.
document.querySelectorAll('[data-default-seo]').forEach((element) => element.remove());

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>
);
