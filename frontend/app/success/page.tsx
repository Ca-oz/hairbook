"use client";

import { useSearchParams } from "next/navigation";

export default function SuccessPage() {
  const params = useSearchParams();

  const service = params.get("service");
  const date = params.get("date");
  const time = params.get("time");
  const name = params.get("name");
  const phone = params.get("phone");

  return (
    <main className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        
        <h1 className="text-2xl font-bold text-black mb-6 text-center">
          Termin erfolgreich gebucht 🎉
        </h1>

        <div className="border rounded-xl p-4 space-y-3 bg-gray-50">
          <div className="flex justify-between">
            <span className="font-semibold text-black">Service</span>
            <span className="text-black">{service}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold text-black">Datum</span>
            <span className="text-black">{date}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold text-black">Uhrzeit</span>
            <span className="text-black">{time}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold text-black">Name</span>
            <span className="text-black">{name}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold text-black">Telefon</span>
            <span className="text-black">{phone}</span>
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-700 text-center">
          Bitte erscheine 5 Minuten vor deinem Termin.
          <br />
          Falls du verhindert bist, kontaktiere uns rechtzeitig.
        </div>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="inline-block bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800"
          >
            Neue Buchung starten
          </a>
        </div>
      </div>
    </main>
  );
}
