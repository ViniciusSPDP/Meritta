"use client";

import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { useEffect, useState, SVGProps } from "react";

// --- Ícones em SVG como componentes para reutilização ---
const SpinnerIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
        <path fill="currentColor" d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity="0.25"></path>
        <path fill="currentColor" d="M10.72,19.9a8,8,0,0,1-6.5-9.79A7.77,7.77,0,0,1,10.4,4.16a8,8,0,0,1,9.49,6.52A1.54,1.54,0,0,0,21.38,12h.13a1.37,1.37,0,0,0,1.38-1.54,11,11,0,1,0-12.7,12.39A1.54,1.54,0,0,0,12,21.34h0A1.47,1.47,0,0,0,10.72,19.9Z">
            <animateTransform attributeName="transform" type="rotate" dur="0.75s" from="0 12 12" to="360 12 12" repeatCount="indefinite"></animateTransform>
        </path>
    </svg>
);

const ErrorIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
        <path fill="currentColor" d="M12,1.25A10.75,10.75,0,1,0,22.75,12,10.76,10.76,0,0,0,12,1.25Zm0,20A9.25,9.25,0,1,1,21.25,12,9.26,9.26,0,0,1,12,21.25Zm-1-4h2V15H11Zm0-10h2v7H11Z"></path>
    </svg>
);

const CrownIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
        <path fill="currentColor" d="M5 16L3 4l5.5 5L12 4l3.5 5L21 4l-2 12H5zm2.7-2h8.6l.9-5.4l-2.1 1.7L12 8l-3.1 2.3l-2.1-1.7L7.7 14z" />
    </svg>
);

const LeafIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
        <path fill="currentColor" d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
    </svg>
);

const QrCodeIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
        <path fill="currentColor" d="M3,11H5V13H3V11M11,5H13V9H11V5M9,11H13V15H9V11M15,11H17V13H15V11M19,11H21V13H19V11M5,5H9V9H5V5M3,3H11V11H3V3M5,15H9V19H5V15M3,13H11V21H3V13M15,3H19V7H15V3M13,1H21V9H13V1M15,15H17V17H15V15M13,13H15V15H13V13M15,17H17V19H15V17M17,15H19V17H17V15M17,13H21V17H17V13M19,17H21V21H19V17Z" />
    </svg>
);

const MessageIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
        <path fill="currentColor" d="M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4A2,2 0 0,0 20,2M20,16H6L4,18V4H20V16Z" />
    </svg>
);

interface DashboardProps {
    session: Session;
}

export default function Dashboard({ session }: DashboardProps) {
    // Estados do QR Code
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [isLoadingQr, setIsLoadingQr] = useState(true);
    const [qrError, setQrError] = useState<string | null>(null);

    // Estados da Mensagem
    const [messageContent, setMessageContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
    const [isLoadingMessage, setIsLoadingMessage] = useState(true);

    // useEffect para buscar dados iniciais
    useEffect(() => {
        const fetchQrCode = async () => {
            try {
                const res = await fetch('/api/evolution/qr');
                const data = await res.json();
                if (res.ok && data.qrCode) {
                    setQrCode(data.qrCode);
                } else {
                    setQrError(data.message || "QR Code não disponível.");
                }
            } catch (err) {
                setQrError("Erro de conexão com a API. Erro: " + err);
            } finally {
                setIsLoadingQr(false);
            }
        };

        const fetchMessage = async () => {
            try {
                const res = await fetch('/api/messages');
                const data = await res.json();
                if (res.ok && data.content) {
                    setMessageContent(data.content);
                }
            } catch (err) {
                console.error("Erro ao buscar mensagem salva:", err);
            } finally {
                setIsLoadingMessage(false);
            }
        };

        fetchQrCode();
        fetchMessage();
    }, []);

    // Função para salvar/atualizar a mensagem
    const handleSaveMessage = async () => {
        if (!messageContent.trim()) return;
        setIsSubmitting(true);
        setSubmitError(null);
        setSubmitSuccess(null);
        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: messageContent }),
            });
            if (res.ok) {
                setSubmitSuccess("Mensagem salva com sucesso!");
                setTimeout(() => setSubmitSuccess(null), 3000);
            } else {
                const data = await res.json();
                setSubmitError(data.error || "Falha ao salvar a mensagem.");
            }
        } catch (err) {
            setSubmitError("Erro de conexão ao salvar. Erro: " + err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50">
            {/* Header com gradiente verde */}
            <header className="bg-gradient-to-r from-emerald-600 via-green-600 to-lime-600 shadow-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                                <CrownIcon className="w-8 h-8 text-yellow-300" />
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                                        MERITTA
                                    </h1>
                                    <p className="text-emerald-100 text-sm font-medium tracking-wider">
                                        ambiental
                                    </p>
                                </div>
                            </div>
                            <div className="hidden sm:block h-8 w-px bg-emerald-300 mx-4"></div>
                            <LeafIcon className="hidden sm:block w-6 h-6 text-emerald-200" />
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-xl text-emerald-600 bg-white hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            Sair
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Info do Usuário */}
                <div className="mb-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                            <p className="text-gray-700">
                                Logado como: <span className="font-semibold text-emerald-700">{session.user?.email}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Grid Principal */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                    {/* Card do QR Code */}
                    <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
                        <div className="bg-gradient-to-r from-emerald-500 to-green-500 px-6 py-4">
                            <div className="flex items-center space-x-3">
                                <QrCodeIcon className="w-6 h-6 text-white" />
                                <h2 className="text-xl font-semibold text-white">Conexão WhatsApp</h2>
                            </div>
                            <p className="text-emerald-100 text-sm mt-1">Escaneie o QR Code para conectar</p>
                        </div>

                        <div className="p-6">
                            <div className="flex items-center justify-center h-80 bg-gradient-to-br from-gray-50 to-emerald-50 rounded-2xl border-2 border-dashed border-emerald-200">
                                {isLoadingQr ? (
                                    <div className="flex flex-col items-center gap-4 text-emerald-600">
                                        <SpinnerIcon className="w-10 h-10" />
                                        <span className="font-medium">Gerando QR Code...</span>
                                        <div className="w-8 h-1 bg-emerald-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 rounded-full animate-pulse"></div>
                                        </div>
                                    </div>
                                ) : qrError ? (
                                    <div className="flex flex-col items-center gap-4 text-red-500 text-center px-4">
                                        <ErrorIcon className="w-12 h-12" />
                                        <span className="font-medium">{qrError}</span>
                                        <button
                                            onClick={() => window.location.reload()}
                                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                                        >
                                            Tentar novamente
                                        </button>
                                    </div>
                                ) : qrCode ? (
                                    <div className="text-center">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={qrCode}
                                            alt="QR Code para WhatsApp"
                                            className="w-72 h-72 object-contain mx-auto rounded-xl shadow-lg bg-white p-4"
                                        />
                                        <p className="text-emerald-600 text-sm font-medium mt-4">
                                            QR Code gerado com sucesso
                                        </p>
                                    </div>
                                ) : (
                                    <div className="text-gray-500 font-medium">QR Code não disponível</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Card de Mensagem */}
                    <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
                        <div className="bg-gradient-to-r from-green-500 to-lime-500 px-6 py-4">
                            <div className="flex items-center space-x-3">
                                <MessageIcon className="w-6 h-6 text-white" />
                                <h2 className="text-xl font-semibold text-white">Mensagem Personalizada</h2>
                            </div>
                            <p className="text-green-100 text-sm mt-1">Configure sua mensagem automática</p>
                        </div>

                        <div className="p-6 flex flex-col h-96">
                            <div className="flex-grow flex flex-col space-y-4">
                                <div className="relative">
                                    <textarea
                                        rows={8}
                                        placeholder={isLoadingMessage ? "Carregando mensagem..." : "Digite sua mensagem personalizada aqui...\n\nExemplo: Olá! Bem-vindo à Meritta Ambiental. Como posso ajudá-lo hoje?"}
                                        className="w-full p-4 text-base border-2 text-gray-600 border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 disabled:bg-gray-50 disabled:cursor-not-allowed resize-none bg-gradient-to-br from-white to-emerald-50"
                                        value={messageContent}
                                        onChange={(e) => setMessageContent(e.target.value)}
                                        disabled={isSubmitting || isLoadingMessage}
                                    />
                                    <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                                        {messageContent.length}/500
                                    </div>
                                </div>

                                <button
                                    onClick={handleSaveMessage}
                                    disabled={!messageContent.trim() || isSubmitting || isLoadingMessage}
                                    className="w-full flex items-center justify-center gap-3 px-6 py-4 font-semibold text-white bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl hover:from-emerald-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-300 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                    {isSubmitting && <SpinnerIcon className="w-5 h-5" />}
                                    {isSubmitting ? 'Salvando mensagem...' : 'Salvar Mensagem'}
                                </button>

                                {/* Feedback Messages */}
                                {submitSuccess && (
                                    <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                        <p className="text-emerald-700 font-medium">{submitSuccess}</p>
                                    </div>
                                )}

                                {submitError && (
                                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                                        <ErrorIcon className="w-5 h-5 text-red-500" />
                                        <p className="text-red-700 font-medium">{submitError}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}