"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Algo salió mal
        </h2>
        <p className="text-gray-600 mb-6">
          Hubo un error al cargar la página. Por favor intenta de nuevo.
        </p>
        <button
          onClick={reset}
          className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}
