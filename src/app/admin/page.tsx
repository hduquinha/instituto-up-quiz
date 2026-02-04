"use client";

import { useState } from "react";

type ResponseItem = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  score: number;
  level: string;
  createdAt: string;
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responses, setResponses] = useState<ResponseItem[]>([]);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/admin/list", {
        headers: { "x-admin-password": password },
      });

      if (!response.ok) {
        throw new Error("Senha inválida ou acesso negado.");
      }

      const data = (await response.json()) as ResponseItem[];
      setResponses(data);
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Não foi possível carregar os dados."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (id: string, name: string) => {
    setError(null);
    try {
      const response = await fetch(`/api/admin/report/${id}`, {
        headers: { "x-admin-password": password },
      });

      if (!response.ok) {
        throw new Error("Erro ao baixar relatório.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `relatorio-${name || "quiz"}.txt`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : "Erro ao baixar relatório."
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-10">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
            Área administrativa
          </p>
          <h1 className="mt-3 text-3xl font-semibold">
            Respostas e relatórios
          </h1>
        </header>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
          <label className="flex flex-col text-sm font-medium text-slate-200">
            Senha de acesso
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white focus:border-slate-400 focus:outline-none"
            />
          </label>
          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="mt-4 rounded-full bg-white px-6 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Carregando..." : "Acessar"}
          </button>
          {error ? (
            <p className="mt-4 rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </p>
          ) : null}
        </div>

        <div className="mt-10 overflow-hidden rounded-3xl border border-slate-800">
          <div className="grid grid-cols-6 gap-4 bg-slate-900/60 px-6 py-4 text-xs uppercase tracking-widest text-slate-400">
            <span>Nome</span>
            <span>Contato</span>
            <span>Nível</span>
            <span>Pontuação</span>
            <span>Data</span>
            <span>Ações</span>
          </div>
          {responses.length === 0 ? (
            <div className="px-6 py-10 text-center text-slate-400">
              Nenhuma resposta carregada.
            </div>
          ) : (
            responses.map((response) => (
              <div
                key={response.id}
                className="grid grid-cols-6 gap-4 border-t border-slate-800 px-6 py-4 text-sm"
              >
                <span className="font-medium text-white">
                  {response.name}
                </span>
                <span className="text-slate-300">
                  {[response.phone, response.email].filter(Boolean).join(" | ")}
                </span>
                <span className="text-slate-300 capitalize">
                  {response.level}
                </span>
                <span className="text-slate-300">{response.score}</span>
                <span className="text-slate-300">
                  {new Date(response.createdAt).toLocaleString("pt-BR")}
                </span>
                <button
                  type="button"
                  onClick={() => handleDownload(response.id, response.name)}
                  className="rounded-full border border-slate-600 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-slate-300"
                >
                  Baixar
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
