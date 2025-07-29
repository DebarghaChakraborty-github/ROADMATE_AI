import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Importing Pages
import Home from "./pages/Home";
import Itinerary from "./pages/Itinerary";
import Profile from "./pages/Profile";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/itinerary" element={<Itinerary />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
