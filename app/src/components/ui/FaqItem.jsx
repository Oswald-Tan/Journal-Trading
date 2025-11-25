import React from "react";
import { ChevronDown } from "lucide-react";

export default function FaqItem({ question }) {
  return (
    <details className="p-4 bg-gray-100 rounded-lg">
      <summary className="flex items-center justify-between cursor-pointer">
        <span className="font-medium">{question}</span>
        <ChevronDown size={18} />
      </summary>
      <div className="mt-2 text-slate-600 text-sm">
        This is a sample answer. Replace with real content specific to your
        platform or service.
      </div>
    </details>
  );
}