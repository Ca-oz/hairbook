"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Service = {
  id: number;
  name: string;
  duration: number;
};

export default function Home() {
  const router = useRouter();
  const API = "https://hairbook-backend.onrender.com";

  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    fetch(`${API}/services/`)
      .then((res) => res.json())
      .then((data) => setServices(data));
  }, []);

  useEffect(() => {
    if (!selectedService || !date) return;

    fetch(
      `${API}/appointments/available?date=${date}&service_id=${selectedService}`
    )
      .then((res) => res.json())
      .then((data) => {
        setSlots(data);
        setSelectedSlot(null);
      });
  }, [selectedService, date]);

  function formatLocal(d: Date) {
    return (
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0") +
      "T" +
      String(d.getHours()).padStart(2, "0") +
      ":" +
      String(d.getMinutes()).padStart(2, "0") +
      ":00"
    );
  }

 async function bookAppointment() {
  if (!selectedService || !date || !selectedSlot || !name || !phone) {
    return;
  }

  const service = services.find((s) => s.id === selectedService);
  if (!service) return;

  const startDate = new Date(`${date}T${selectedSlot}:00`);
  const endDate = new Date(
    startDate.getTime() + service.duration * 60000
  );

  const formatLocal = (d: Date) => {
    return (
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0") +
      "T" +
      String(d.getHours()).padStart(2, "0") +
      ":" +
      String(d.getMinutes()).padStart(2, "0") +
      ":00"
    );
  };

  const startFormatted = formatLocal(startDate);
  const endFormatted = formatLocal(endDate);

  const url =
    `${API}/appointments/?start=${encodeURIComponent(startFormatted)}` +
    `&end=${encodeURIComponent(endFormatted)}` +
    `&service_name=${encodeURIComponent(service.name)}` +
    `&customer_name=${encodeURIComponent(name)}` +
    `&customer_phone=${encodeURIComponent(phone)}`;

  const response = await fetch(url, { method: "POST" });
  const data = await response.json();

  if (response.ok && !data.error) {
    router.push(
      `/success?service=${encodeURIComponent(service.name)}&date=${encodeURIComponent(
        date
      )}&time=${encodeURIComponent(
        selectedSlot
      )}&name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}`
    );
  }
}

  return (
    <main className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-black">
          Hairbook – Termin buchen
        </h1>

        <h2 className="font-semibold mb-2 text-black">Service wählen</h2>
        <div className="space-y-2">
          {services.map((service) => (
            <label
              key={service.id}
              className="flex items-center gap-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50"
            >
              <input
                type="radio"
                name="service"
                value={service.id}
                onChange={() => setSelectedService(service.id)}
              />
              <span className="text-black">
                {service.name} ({service.duration} Min)
              </span>
            </label>
          ))}
        </div>

        <div className="mt-6">
          <input
            type="date"
            className="w-full border rounded-lg p-3 text-black"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {slots.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2 text-black">
              Verfügbare Zeiten
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-2 rounded-lg border ${
                    selectedSlot === slot
                      ? "bg-black text-white"
                      : "bg-white text-black hover:bg-gray-100"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 space-y-3">
          <input
            className="w-full border rounded-lg p-3 text-black"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="w-full border rounded-lg p-3 text-black"
            placeholder="Telefon"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <button
            onClick={bookAppointment}
            className="w-full bg-black text-white rounded-lg p-3 font-semibold hover:bg-gray-800"
          >
            Termin buchen
          </button>
        </div>
      </div>
    </main>
  );
}
