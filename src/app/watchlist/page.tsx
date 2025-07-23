"use client"
import { useEffect, useState } from "react";

export default function WatchlistPage() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:8080/api/hello")
      .then((res) => res.text())
      .then((text) => setMessage(text))
      .catch((err) => console.error("Error fetching:", err));
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">📈 Watchlist</h1>
      <p className="mt-4 text-lg">
        {message ? message : "Loading from Spring Boot..."}
      </p>
    </main>
  );
}

