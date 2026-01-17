import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import { LanguageProvider } from '@/i18n';

function App() {
    return (
        <LanguageProvider>
            <Router basename={import.meta.env.BASE_URL}>
                <Routes>
                    <Route path="/" element={<Home />} />
                </Routes>
            </Router>
        </LanguageProvider>
    )
}

export default App
