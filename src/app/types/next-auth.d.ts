// src/types/next-auth.d.ts

import { DefaultSession } from "next-auth";

// Usamos a "declaração de módulo" para estender os tipos originais
declare module "next-auth" {
  /**
   * O objeto Session retornado por useSession(), getSession(), etc.
   */
  interface Session {
    user: {
      /** O ID do usuário no banco de dados. */
      id: string;
      // Mantemos as propriedades originais do usuário (name, email, image)
    } & DefaultSession["user"];
  }
}