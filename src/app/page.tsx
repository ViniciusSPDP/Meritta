// src/app/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Dashboard from "@/components/Dashboard"; // Vamos criar este componente a seguir

export default async function HomePage() {
  // 1. Busca a sessão do usuário no lado do servidor.
  // É mais seguro e rápido do que fazer no cliente.
  const session = await getServerSession(authOptions);

  // 2. Se não houver sessão (usuário não está logado),
  // redireciona para a página de login.
  if (!session) {
    redirect("/login");
  }

  // 3. Se houver uma sessão, renderiza o componente do Dashboard
  // passando a sessão como propriedade.
  return (
    <main>
      <Dashboard session={session} />
    </main>
  );
}