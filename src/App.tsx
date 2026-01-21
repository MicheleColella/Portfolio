import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import AdminPage from '@/pages/admin';
import { LanguageProvider } from '@/i18n';
import { MobilePreviewProvider } from '@/context/MobilePreviewContext';

function App() {
    return (
        <LanguageProvider>
            <MobilePreviewProvider>
                <Router basename={import.meta.env.BASE_URL}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/admin" element={<AdminPage />} />
                    </Routes>
                </Router>
            </MobilePreviewProvider>
        </LanguageProvider>
    )
}

export default App
