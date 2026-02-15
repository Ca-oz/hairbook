"use client";

import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";

type Appointment = {
  id: number;
  start: string;
  end: string;
  service_name: string;
  customer_name: string;
  customer_phone: string;
};

type Closure = {
  id: number;
  start: string;
  end: string;
  note: string;
};

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState<string | null>(null);
  const [pinInput, setPinInput] = useState("");
  const [error, setError] = useState("");

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [closures, setClosures] = useState<Closure[]>([]);

  const [closureStart, setClosureStart] = useState("");
  const [closureEnd, setClosureEnd] = useState("");
  const [closureNote, setClosureNote] = useState("");

  // -------------------------
  // Session prüfen beim Start
  // -------------------------
  useEffect(() => {
    const savedKey = sessionStorage.getItem("adminKey");
    if (savedKey) {
      setAdminKey(savedKey);
      loadData(savedKey);
    }
  }, []);

  // -------------------------
  // Login
  // -------------------------
  async function handleLogin() {
    try {
      const res = await fetch(`${API}/admin/appointments`, {
        headers: { "x-admin-key": pinInput },
      });

      if (!res.ok) {
        setError("Falsche PIN");
        return;
      }

      sessionStorage.setItem("adminKey", pinInput);
      setAdminKey(pinInput);
      setError("");
      loadData(pinInput);
    } catch {
      setError("Backend nicht erreichbar");
    }
  }

  // -------------------------
  // Daten laden
  // -------------------------
  async function loadData(key: string) {
    const apptRes = await fetch(`${API}/admin/appointments`, {
      headers: { "x-admin-key": key },
    });
    const apptData = await apptRes.json();
    setAppointments(apptData);

    const closureRes = await fetch(`${API}/admin/closures`, {
      headers: { "x-admin-key": key },
    });
    const closureData = await closureRes.json();
    setClosures(closureData);
  }

  async function deleteAppointment(id: number) {
    await fetch(`${API}/admin/appointments/${id}`, {
      method: "DELETE",
      headers: { "x-admin-key": adminKey! },
    });
    loadData(adminKey!);
  }

  async function deleteClosure(id: number) {
    await fetch(`${API}/admin/closures/${id}`, {
      method: "DELETE",
      headers: { "x-admin-key": adminKey! },
    });
    loadData(adminKey!);
  }

  async function createClosure() {
    if (!closureStart || !closureEnd) return;

    await fetch(
      `${API}/admin/closures?start=${encodeURIComponent(
        closureStart
      )}&end=${encodeURIComponent(closureEnd)}&note=${encodeURIComponent(
        closureNote
      )}`,
      {
        method: "POST",
        headers: { "x-admin-key": adminKey! },
      }
    );

    setClosureStart("");
    setClosureEnd("");
    setClosureNote("");
    loadData(adminKey!);
  }

  // -------------------------
  // LOGIN SCREEN
  // -------------------------
  if (!adminKey) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-2xl shadow w-full max-w-sm">
          <h1 className="text-2xl font-bold mb-6 text-center text-black">
            Admin Login
          </h1>

          <input
            type="password"
            placeholder="PIN eingeben"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            className="w-full border rounded-lg p-3 mb-4 text-black"
          />

          <button
            onClick={handleLogin}
            className="w-full bg-black text-white rounded-lg p-3"
          >
            Login
          </button>

          {error && (
            <p className="text-red-500 text-sm mt-3 text-center">{error}</p>
          )}
        </div>
      </main>
    );
  }

  // -------------------------
  // ADMIN BEREICH
  // -------------------------
  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-4xl mx-auto space-y-8">

        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-black">Admin Bereich</h1>

          <button
            onClick={() => {
              sessionStorage.removeItem("adminKey");
              setAdminKey(null);
            }}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>

        {/* Termine */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-black">
            Alle Termine
          </h2>

          <div className="space-y-3">
            {appointments.map((a) => (
              <div
                key={a.id}
                className="flex justify-between items-center border rounded-lg p-4"
              >
                <div>
                  <div className="font-medium text-black">
                    {a.customer_name} ({a.customer_phone})
                  </div>
                  <div className="text-sm text-gray-600">
                    {a.service_name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(a.start).toLocaleString()} –
                    {new Date(a.end).toLocaleString()}
                  </div>
                </div>

                <button
                  onClick={() => deleteAppointment(a.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg"
                >
                  Löschen
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Blockzeiten */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-black">
            Blockzeiten
          </h2>

          <div className="grid md:grid-cols-4 gap-3 mb-6">
            <input
              type="datetime-local"
              value={closureStart}
              onChange={(e) => setClosureStart(e.target.value)}
              className="border p-2 rounded text-black"
            />
            <input
              type="datetime-local"
              value={closureEnd}
              onChange={(e) => setClosureEnd(e.target.value)}
              className="border p-2 rounded text-black"
            />
            <input
              placeholder="Notiz"
              value={closureNote}
              onChange={(e) => setClosureNote(e.target.value)}
              className="border p-2 rounded text-black"
            />
            <button
              onClick={createClosure}
              className="bg-black text-white rounded-lg"
            >
              Blocken
            </button>
          </div>

          <div className="space-y-3">
            {closures.map((c) => (
              <div
                key={c.id}
                className="flex justify-between items-center border rounded-lg p-4"
              >
                <div>
                  <div className="font-medium text-black">{c.note}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(c.start).toLocaleString()} –
                    {new Date(c.end).toLocaleString()}
                  </div>
                </div>

                <button
                  onClick={() => deleteClosure(c.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg"
                >
                  Löschen
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
