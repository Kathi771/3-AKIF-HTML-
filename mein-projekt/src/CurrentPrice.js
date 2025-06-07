import { useEffect, useState } from "react";

function CurrentPrice() {
  const [selectedSymbol, setSelectedSymbol] = useState("GOOG");
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/currentPrices.json")
      .then((res) => res.json())
      .then((data) => {
        if (data[selectedSymbol]) {
          setPrice(data[selectedSymbol]);
        } else {
          setPrice(null);
        }
      })
      .catch((err) => {
        console.error(err);
        setPrice(null);
      })
      .finally(() => setLoading(false));
  }, [selectedSymbol]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Current Stock Price</h2>

      {/* Dropdown */}
      <label htmlFor="symbol" className="block mb-2 font-semibold">
        Select a stock symbol:
      </label>
      <select
        id="symbol"
        value={selectedSymbol}
        onChange={(e) => setSelectedSymbol(e.target.value)}
        className="mb-4 p-2 rounded border border-gray-300 text-black"
      >
        <option value="GOOG">GOOG</option>
        <option value="AAPL">AAPL</option>
        <option value="TSLA">TSLA</option>
        <option value="MSFT">MSFT</option>
      </select>

      {/* Ergebnisanzeige */}
      {loading ? (
        <p>Loading price...</p>
      ) : price !== null ? (
        <p className="text-xl">
          Price for <strong>{selectedSymbol}</strong>:{" "}
          <span className="font-semibold">${price.toFixed(2)}</span>
        </p>
      ) : (
        <p>No data found for <strong>{selectedSymbol}</strong>.</p>
      )}
    </div>
  );
}

export default CurrentPrice;




