// src/app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // Importa do nosso novo arquivo central

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };