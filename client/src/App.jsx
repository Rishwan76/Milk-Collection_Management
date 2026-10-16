import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AddEntry from './pages/AddEntry.jsx';
import AllEntries from './pages/AllEntries.jsx';
import Reports from './pages/Reports.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/entries/new" element={<AddEntry />} />
        <Route path="/entries/:id/edit" element={<AddEntry />} />
        <Route path="/entries" element={<AllEntries />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="*" element={<p>Page not found</p>} />
      </Route>
    </Routes>
  );
}
