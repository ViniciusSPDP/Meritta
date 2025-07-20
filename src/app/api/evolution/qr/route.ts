// src/app/api/evolution/qr/route.ts

import { NextResponse } from "next/server";
// --- IMPORTAÇÕES ADICIONADAS ---
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
// -----------------------------

const API_URL = process.env.EVOLUTION_API_URL;
const API_KEY = process.env.EVOLUTION_API_KEY;
const INSTANCE_NAME = "Meritta"; // O nome da sua instância

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  // --- NOVA VERIFICAÇÃO DE PLANO ---
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.plan !== 'PRO') {
    return NextResponse.json(
      { error: "Apenas usuários PRO podem ver o QR Code." },
      { status: 403 }
    );
  }

  if (!API_URL || !API_KEY) {
    return NextResponse.json(
      { error: "Variáveis de ambiente da Evolution API não configuradas." },
      { status: 500 }
    );
  }

  try {
    // O endpoint para conectar uma instância e obter o QR code
    const evolutionEndpoint = `${API_URL}/instance/connect/${INSTANCE_NAME}`;

    const response = await fetch(evolutionEndpoint, {
      method: "GET",
      headers: {
        "apikey": API_KEY,
      },
      // Importante: Desabilita o cache para sempre buscar um QR code novo
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erro da Evolution API:", errorData);
      return NextResponse.json(
        { error: "Falha ao conectar com a Evolution API.", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();

    // A Evolution API geralmente retorna o QR code em um campo "base64"
    if (data.base64) {
      return NextResponse.json({ qrCode: data.base64 });
    } else {
      // Pode ser que a instância já esteja conectada
      return NextResponse.json({
        message: "Instância já conectada ou sem QR code disponível.",
        details: data
      });
    }

  } catch (error) {
    console.error("Erro interno ao buscar QR code:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro no servidor." },
      { status: 500 }
    );
  }
}