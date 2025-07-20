// src/app/api/messages/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// --- NOVA FUNÇÃO GET: Para buscar a mensagem do usuário ---
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.plan !== 'PRO') {
    return NextResponse.json(
      { error: "Apenas usuários PRO podem salvar mensagens." },
      { status: 403 } // 403 Forbidden: Acesso negado
    );
  }

  try {
    const message = await prisma.message.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!message) {
      return NextResponse.json({ message: null }, { status: 200 });
    }

    return NextResponse.json(message, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar mensagem:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro no servidor." },
      { status: 500 }
    );
  }
}

// --- FUNÇÃO POST ATUALIZADA: Para criar ou atualizar a mensagem ---
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "O conteúdo da mensagem é obrigatório." },
        { status: 400 }
      );
    }

    // Lógica de "Upsert": Atualiza se existir, cria se não existir.
    const upsertedMessage = await prisma.message.upsert({
      where: {
        // Encontra a mensagem pelo ID do usuário (que agora é único)
        userId: session.user.id,
      },
      update: {
        // O que fazer se encontrar a mensagem
        content: content,
      },
      create: {
        // O que fazer se NÃO encontrar a mensagem
        content: content,
        userId: session.user.id,
      },
    });

    return NextResponse.json(upsertedMessage, { status: 200 });
  } catch (error) {
    console.error("Erro ao salvar mensagem:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro no servidor." },
      { status: 500 }
    );
  }
}