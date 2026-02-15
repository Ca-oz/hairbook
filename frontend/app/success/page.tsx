"use client";

import { Suspense } from "react";
import SuccessContent from "./success-content";

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Lade...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
