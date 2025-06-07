import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const fallbackData = [
  { date: "2025-06-01", price: 150 },
  { date: "2025-06-02", price: 155 },
  { date: "2025-06-03", price: 148 },
  { date: "2025-06-04", price: 160 },
  { date: "2025-06-05", price: 165 },
  { date: "2025-06-06", price: 158 },
  { date: "2025-06-07", price: 162 },
];

function StockChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/chartData.json")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((json) => {
        if (json.length === 0) {
          setData(fallbackData);
        } else {
          setData(json);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setData(fallbackData);
        setLoading(false);
      });
  }, []);

  // Daten für Anzeige
  const prices = data.map((d) => d.price);
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const avgPrice = (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2);
  const startDate = data[0]?.date || "N/A";
  const endDate = data[data.length - 1]?.date || "N/A";
  const lastPrice = data[data.length - 1]?.price || "N/A";

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">
        Stock Price Chart ({startDate} to {endDate})
      </h2>

      <div className="mb-4 space-x-6">
        <span><strong>Highest Price:</strong> ${maxPrice}</span>
        <span><strong>Lowest Price:</strong> ${minPrice}</span>
        <span><strong>Average Price:</strong> ${avgPrice}</span>
        <span><strong>Last Price:</strong> ${lastPrice}</span>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis domain={["auto", "auto"]} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#8884d8"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default StockChart;



