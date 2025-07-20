// src/app/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Dashboard from "@/components/Dashboard";
import prisma from "@/lib/prisma";

export default async function HomePage() {
  // 1. Busca a sessão do usuário.
  const session = await getServerSession(authOptions);

  // 2. Se não houver sessão ou ID do usuário, redireciona para a página de login.
  // A execução da função para aqui para usuários não logados.
  if (!session?.user?.id) {
    redirect("/login");
  }

  // 3. Se o código chegou até aqui, significa que a sessão EXISTE.
  // Agora podemos buscar os dados do usuário no banco com segurança.
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  // 4. Se por algum motivo o usuário da sessão não for encontrado no banco,
  // também redirecionamos para o login por segurança.
  if (!user) {
    redirect("/login");
  }

  // 5. Renderiza o Dashboard, passando a sessão e o plano do usuário.
  // Neste ponto, 'session' e 'user' são garantidamente válidos.
  return (
    <main>
      <Dashboard 
        session={session} 
        userPlan={user.plan ?? 'FREE'} 
      />
    </main>
  );
}