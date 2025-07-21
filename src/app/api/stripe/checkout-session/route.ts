// src/app/api/stripe/checkout-session/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { user } = session;
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });

  if (!dbUser) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  // Lógica para criar ou buscar o cliente na Stripe
  let stripeCustomerId = dbUser.stripeCustomerId;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({ email: user.email! });
    stripeCustomerId = customer.id;
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: stripeCustomerId },
    });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: stripeCustomerId, // Passa o ID do cliente
    payment_method_types: ['card'],
    line_items: [{
      price: process.env.STRIPE_PRICE_ID,
      quantity: 1,
    }],
    mode: 'subscription', 
    success_url: `${process.env.NEXTAUTH_URL}/?payment=success`,
    cancel_url: `${process.env.NEXTAUTH_URL}/?payment=cancel`,
    // Não precisamos mais de metadados, pois o ID do cliente já está ligado à sessão
  });

  return NextResponse.json({ sessionId: checkoutSession.id });
}