function Settings({ darkMode, setDarkMode }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Settings</h2>

      <label className="flex items-center space-x-3 cursor-pointer select-none">
        <span>🌞</span>
        <input
          type="checkbox"
          checked={darkMode}
          onChange={() => setDarkMode(!darkMode)}
          className="hidden"
        />
        <div className="w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full relative">
          <div
            className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
              darkMode ? "translate-x-6" : ""
            }`}
          ></div>
        </div>
        <span>🌜</span>
      </label>
    </div>
  );
}

export default Settings;



