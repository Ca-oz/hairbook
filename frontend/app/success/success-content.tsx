"use client";

import { useSearchParams } from "next/navigation";

export default function SuccessContent() {
  const searchParams = useSearchParams();

  const name = searchParams.get("name");
  const service = searchParams.get("service");
  const date = searchParams.get("date");
  const time = searchParams.get("time");

  return (
    <main className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4 text-black">
          Termin erfolgreich gebucht
        </h1>

        <div className="space-y-2 text-black">
          <p><strong>Name:</strong> {name}</p>
          <p><strong>Service:</strong> {service}</p>
          <p><strong>Datum:</strong> {date}</p>
          <p><strong>Uhrzeit:</strong> {time}</p>
        </div>
      </div>
    </main>
  );
}
