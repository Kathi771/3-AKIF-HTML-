import { useState, useEffect } from "react";
import CurrentPrice from "./CurrentPrice";
import StockChart from "./components/StockChart";
import News from "./components/News";
import Favorites from "./components/Favorites";
import MatrixMultiplication from "./MatrixMultiplication";
import Settings from "./Settings";

function App() {
  const [activeTab, setActiveTab] = useState("current");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div
      className={`min-h-screen p-6 text-white transition-colors duration-300
        ${
          darkMode
            ? "bg-gray-900 text-white"
            : "bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-white"
        }
      `}
    >
      <h1 className="text-4xl font-bold mb-6 text-center">Stock Dashboard</h1>

      {/* Navigation */}
      <nav className="flex justify-center space-x-4 mb-6">
        {[
          { id: "current", label: "Current Price" },
          { id: "chart", label: "Chart" },
          { id: "news", label: "News" },
          { id: "favorites", label: "Favorites" },
          { id: "settings", label: "Settings" },
          { id: "matrix", label: "Matrix Multiplication" },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`px-4 py-2 rounded ${
              activeTab === tab.id
                ? "bg-white text-blue-600 font-bold"
                : "bg-white bg-opacity-30 text-white"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main
        className={`max-w-4xl mx-auto rounded-lg p-6 shadow-lg min-h-[300px] transition-colors duration-300
          ${
            darkMode
              ? "bg-gray-800 text-white"
              : "bg-white bg-opacity-20 text-black"
          }
        `}
      >
        {activeTab === "current" && <CurrentPrice />}
        {activeTab === "chart" && <StockChart />}
        {activeTab === "news" && <News />}
        {activeTab === "favorites" && <Favorites />}
        {activeTab === "matrix" && <MatrixMultiplication />}
        {activeTab === "settings" && (
          <Settings darkMode={darkMode} setDarkMode={setDarkMode} />
        )}
      </main>
    </div>
  );
}

export default App;





 
  
