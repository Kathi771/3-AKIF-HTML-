function Favorites() {
  const favorites = [
    { symbol: "AAPL", name: "Apple Inc.", price: 192.32 },
    { symbol: "TSLA", name: "Tesla Inc.", price: 174.6 },
    { symbol: "GOOGL", name: "Alphabet Inc.", price: 178.99 },
  ];

  return (
    <div className="bg-white bg-opacity-20 p-6 rounded-2xl shadow-lg text-black w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">⭐ Favorite Stocks</h2>
      <ul className="space-y-3">
        {favorites.map((stock) => (
          <li
            key={stock.symbol}
            className="flex justify-between items-center p-3 bg-white bg-opacity-70 rounded-lg shadow-sm"
          >
            <div>
              <div className="font-semibold">{stock.name}</div>
              <div className="text-sm text-gray-700">({stock.symbol})</div>
            </div>
            <div className="text-green-700 font-bold">${stock.price.toFixed(2)}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Favorites;





