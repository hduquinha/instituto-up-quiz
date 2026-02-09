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
  const [selectedResponse, setSelectedResponse] = useState<ResponseItem | null>(
    null
  );
  const [showWhatsappPicker, setShowWhatsappPicker] = useState(false);

  const normalizePhone = (phone: string) => {
    const digits = phone.replace(/\D/g, "");
    if (!digits) return null;
    if (digits.startsWith("55")) return digits;
    return `55${digits}`;
  };

  const buildWhatsappMessage = (name: string) =>
    `Oi ${name || ""}! Fechei seu relatorio do quiz. Segue o PDF em anexo. ` +
    "Se quiser, posso explicar os pontos principais por aqui.";

  const buildWhatsappUrl = (
    phone: string,
    message: string,
    useBusiness: boolean
  ) => {
    const encodedMessage = encodeURIComponent(message);
    const isMobile =
      typeof window !== "undefined" &&
      /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      if (useBusiness) {
        return `https://api.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`;
      }
      return `https://wa.me/${phone}?text=${encodedMessage}`;
    }
    if (useBusiness) {
      return `https://web.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`;
    }
    return `https://wa.me/${phone}?text=${encodedMessage}`;
  };

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
      link.download = `relatorio-${name || "quiz"}.pdf`;
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

  const handleContactClick = (response: ResponseItem) => {
    if (!response.phone) {
      setError("Telefone não disponível para este contato.");
      return;
    }
    setSelectedResponse(response);
    setShowWhatsappPicker(true);
  };

  const handleWhatsappChoice = async (useBusiness: boolean) => {
    if (!selectedResponse?.phone) {
      setShowWhatsappPicker(false);
      return;
    }

    const normalizedPhone = normalizePhone(selectedResponse.phone);
    if (!normalizedPhone) {
      setError("Telefone inválido.");
      setShowWhatsappPicker(false);
      return;
    }

    const message = buildWhatsappMessage(selectedResponse.name);
    const url = buildWhatsappUrl(normalizedPhone, message, useBusiness);
    window.open(url, "_blank", "noopener,noreferrer");
    await handleDownload(selectedResponse.id, selectedResponse.name);
    setShowWhatsappPicker(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6 sm:py-16">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-10">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
            Área administrativa
          </p>
          <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">
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
          <div className="hidden grid-cols-6 gap-4 bg-slate-900/60 px-6 py-4 text-xs uppercase tracking-widest text-slate-400 md:grid">
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
                className="grid grid-cols-1 gap-4 border-t border-slate-800 px-5 py-5 text-sm md:grid-cols-6 md:gap-4 md:px-6 md:py-4"
              >
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 md:hidden">
                    Nome
                  </p>
                  <span className="font-medium text-white">
                    {response.name}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 md:hidden">
                    Contato
                  </p>
                  <span className="text-slate-300">
                    {response.phone ? (
                      <button
                        type="button"
                        onClick={() => handleContactClick(response)}
                        className="font-semibold text-white transition hover:text-slate-200"
                      >
                        {response.phone}
                      </button>
                    ) : (
                      <span className="text-slate-500">Sem telefone</span>
                    )}
                    {response.email ? (
                      <span className="block text-slate-400 md:inline">
                        {response.phone ? " | " : ""}
                        {response.email}
                      </span>
                    ) : null}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 md:hidden">
                    Nivel
                  </p>
                  <span className="text-slate-300 capitalize">
                    {response.level}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 md:hidden">
                    Pontuacao
                  </p>
                  <span className="text-slate-300">{response.score}</span>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 md:hidden">
                    Data
                  </p>
                  <span className="text-slate-300">
                    {new Date(response.createdAt).toLocaleString("pt-BR")}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 md:hidden">
                    Acoes
                  </p>
                  <button
                    type="button"
                    onClick={() => handleDownload(response.id, response.name)}
                    className="rounded-full border border-slate-600 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-slate-300"
                  >
                    Baixar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showWhatsappPicker && selectedResponse ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 text-white">
            <h2 className="text-lg font-semibold">
              Abrir conversa no WhatsApp
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Escolha qual versao do WhatsApp usar para falar com{
                " "
              }
              <span className="font-semibold text-white">
                {selectedResponse.name}
              </span>
              . O PDF sera baixado em seguida para anexar.
            </p>
            <p className="mt-2 text-xs text-slate-400">
              No celular, o link abre o app instalado e voce anexa o PDF manualmente.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => handleWhatsappChoice(false)}
                className="rounded-full bg-white px-6 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
              >
                WhatsApp normal
              </button>
              <button
                type="button"
                onClick={() => handleWhatsappChoice(true)}
                className="rounded-full border border-slate-600 px-6 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-300"
              >
                WhatsApp Business
              </button>
              <button
                type="button"
                onClick={() => setShowWhatsappPicker(false)}
                className="rounded-full border border-slate-700 px-6 py-2 text-sm font-semibold text-slate-400 transition hover:border-slate-500"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
