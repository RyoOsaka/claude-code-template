import { useEffect, useState } from "react";

export function App() {
  const [health, setHealth] = useState<string>("loading...");

  useEffect(() => {
    fetch("/api/v1/health")
      .then((res) => res.json())
      .then((data) => setHealth(data.status))
      .catch(() => setHealth("error"));
  }, []);

  return (
    <div>
      <h1>App</h1>
      <p>API Status: {health}</p>
    </div>
  );
}
