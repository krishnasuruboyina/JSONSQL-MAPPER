import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

const DB_TYPES = [
  { value: "postgresql", label: "PostgreSQL" },
  { value: "mysql", label: "MySQL" },
  { value: "oracle", label: "Oracle" },
  { value: "mssql", label: "SQL Server" },
];

function Home() {
  const navigate = useNavigate();

  const [dbType, setDbType] = useState("postgresql");
  const [serverName, setServerName] = useState("");
  const [port, setPort] = useState("");
  const [databaseName, setDatabaseName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [connected, setConnected] = useState(false);

  // Load values from sessionStorage
  useEffect(() => {
    const savedDbType = sessionStorage.getItem("dbType");
    const savedServer = sessionStorage.getItem("serverName");
    const savedPort = sessionStorage.getItem("port");
    const savedDatabase = sessionStorage.getItem("databaseName");
    const savedUsername = sessionStorage.getItem("username");
    const savedConnected = sessionStorage.getItem("connected");

    if (savedDbType) setDbType(savedDbType);
    if (savedServer) setServerName(savedServer);
    if (savedPort) setPort(savedPort);
    if (savedDatabase) setDatabaseName(savedDatabase);
    if (savedUsername) setUsername(savedUsername);
    if (savedConnected === "true") setConnected(true);
  }, []);

  const connectDatabase = async () => {
    if (!serverName.trim()) {
      alert("Please enter server name");
      return;
    }

    if (!databaseName.trim()) {
      alert("Please enter database name");
      return;
    }

    if (!username.trim()) {
      alert("Please enter username");
      return;
    }

    if (!password.trim()) {
      alert("Please enter password");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/connect-db`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dbType,
          serverName,
          port: port ? Number(port) : undefined,
          databaseName,
          username,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setConnected(true);

        sessionStorage.setItem("dbType", dbType);
        sessionStorage.setItem("serverName", serverName);
        sessionStorage.setItem("port", port);
        sessionStorage.setItem("databaseName", databaseName);
        sessionStorage.setItem("connected", "true");
        sessionStorage.setItem("username", username);

        alert(data.message);
      } else {
        alert(data.error);
      }
    } catch {
      alert("Database connection failed");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f7fb",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "20px",
          width: "420px",
          boxShadow: "0px 4px 20px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            marginBottom: "30px",
            color: "#2c3e50",
          }}
        >
          JSON Mapper Utility
        </h1>

        <div style={{ textAlign: "left" }}>
          <label style={{ fontWeight: "bold" }}>Database Type</label>

          <select
            value={dbType}
            onChange={(e) => setDbType(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "8px",
              marginBottom: "20px",
              borderRadius: "10px",
              border: "1px solid #ccc",
              fontSize: "16px",
              boxSizing: "border-box",
            }}
          >
            {DB_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          <label style={{ fontWeight: "bold" }}>Server Host</label>

          <input
            type="text"
            value={serverName}
            onChange={(e) => setServerName(e.target.value)}
            placeholder="e.g. my-db-host.example.com"
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "8px",
              marginBottom: "20px",
              borderRadius: "10px",
              border: "1px solid #ccc",
              fontSize: "16px",
              boxSizing: "border-box",
            }}
          />

          <label style={{ fontWeight: "bold" }}>
            Port (optional — defaults per database type)
          </label>

          <input
            type="text"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            placeholder="e.g. 5432"
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "8px",
              marginBottom: "20px",
              borderRadius: "10px",
              border: "1px solid #ccc",
              fontSize: "16px",
              boxSizing: "border-box",
            }}
          />

          <label style={{ fontWeight: "bold" }}>Database Name</label>

          <input
            type="text"
            value={databaseName}
            onChange={(e) => setDatabaseName(e.target.value)}
            placeholder="JsonDDLGenerator"
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "8px",
              marginBottom: "20px",
              borderRadius: "10px",
              border: "1px solid #ccc",
              fontSize: "16px",
              boxSizing: "border-box",
            }}
          />

          <label style={{ fontWeight: "bold" }}>Username</label>

          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "8px",
              marginBottom: "20px",
              borderRadius: "10px",
              border: "1px solid #ccc",
              fontSize: "16px",
              boxSizing: "border-box",
            }}
          />

          <label style={{ fontWeight: "bold" }}>Password</label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "8px",
              marginBottom: "20px",
              borderRadius: "10px",
              border: "1px solid #ccc",
              fontSize: "16px",
              boxSizing: "border-box",
            }}
          />
        </div>

        <button
          onClick={connectDatabase}
          style={{
            width: "100%",
            padding: "14px",
            border: "none",
            borderRadius: "10px",
            background: "#3498db",
            color: "white",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          Connect Database
        </button>

        {connected && (
          <p
            style={{
              color: "green",
              marginTop: "20px",
              fontWeight: "bold",
              fontSize: "18px",
            }}
          >
            Database Connected ✅
          </p>
        )}

        <div
          style={{
            marginTop: "30px",
            display: "flex",
            gap: "15px",
          }}
        >
          <button
            disabled={!connected}
            onClick={() => navigate("/path1")}
            style={{
              flex: 1,
              padding: "14px",
              border: "none",
              borderRadius: "10px",
              background: connected ? "#27ae60" : "#bdc3c7",
              color: "white",
              cursor: connected ? "pointer" : "not-allowed",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            Path 1
          </button>

          <button
            disabled={!connected}
            onClick={() => navigate("/path2")}
            style={{
              flex: 1,
              padding: "14px",
              border: "none",
              borderRadius: "10px",
              background: connected ? "#9b59b6" : "#bdc3c7",
              color: "white",
              cursor: connected ? "pointer" : "not-allowed",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            Path 2
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
