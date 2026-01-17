import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import { LanguageProvider } from '@/i18n';
import { MobilePreviewProvider } from '@/context/MobilePreviewContext';

function App() {
    return (
        <LanguageProvider>
            <MobilePreviewProvider>
                <Router basename={import.meta.env.BASE_URL}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                    </Routes>
                </Router>
            </MobilePreviewProvider>
        </LanguageProvider>
    )
}

export default App

