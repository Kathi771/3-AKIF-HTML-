import { useEffect, useState } from "react";

function News() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    fetch("/news.json")
      .then((res) => res.json())
      .then(setArticles)
      .catch(console.error);
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Financial News (Demo)</h2>
      <ul className="space-y-2">
        {articles.map((article, index) => (
          <li key={index}>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              {article.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default News;
