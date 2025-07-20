// src/app/api/auth/register/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Validação básica
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email e senha são obrigatórios." },
        { status: 400 }
      );
    }

    // Verifica se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Este email já está em uso." },
        { status: 409 } // 409 Conflict
      );
    }

    // Faz o hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria o usuário no banco de dados
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    // Retorna o usuário criado (sem a senha)
    const { password: _ , ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword, { status: 201 }); // 201 Created

  } catch (error) {
    console.error("Erro no registro:", error);
    return NextResponse.json(
      { message: "Ocorreu um erro no servidor." },
      { status: 500 }
    );
  }
}