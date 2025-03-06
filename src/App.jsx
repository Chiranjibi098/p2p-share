import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/P2p";
import HomeLayout from "./pages/HomeLayout";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Landing Screen */}
                <Route element={<HomeLayout />}>
                    <Route path="/" element={<Home />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;