"use client";

import { useEffect, useState } from "react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function ApiDocsPage() {
  const [spec, setSpec] = useState(null);

  useEffect(() => {
    fetch("/api/docs")
      .then((res) => res.json())
      .then((data) => setSpec(data));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 text-white px-8 py-6">
        <h1 className="text-2xl font-bold">📋 Todo List API Documentation</h1>
        <p className="text-gray-400 mt-1">
          Interactive API documentation powered by Swagger UI
        </p>
      </div>
      {spec ? (
        <SwaggerUI
          spec={spec}
          tryItOutEnabled={true}
          requestInterceptor={(req) => {
            // Auto-add auth token from localStorage if present
            const token = localStorage.getItem("auth_token");
            if (token && !req.headers["Authorization"]) {
              req.headers["Authorization"] = `Bearer ${token}`;
            }
            return req;
          }}
        />
      ) : (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
        </div>
      )}
    </div>
  );
}
