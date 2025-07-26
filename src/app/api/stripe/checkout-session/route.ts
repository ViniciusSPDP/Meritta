// src/app/api/stripe/checkout-session/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    console.log('=== INICIO CHECKOUT API ===');
    
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      console.log('Usuário não autorizado');
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Ler dados do request
    let requestData;
    try {
      requestData = await request.json();
      console.log('Dados do request:', requestData);
    } catch (err) {
      console.log('Nenhum body enviado, usando valores padrão' + err);
      requestData = {};
    }

    const { priceId } = requestData;
    const finalPriceId = priceId || process.env.STRIPE_PRICE_ID;
    
    console.log('Price ID a ser usado:', finalPriceId);

    if (!finalPriceId) {
      return NextResponse.json({ 
        error: "Price ID não encontrado. Verifique as variáveis de ambiente." 
      }, { status: 400 });
    }

    const { user } = session;
    console.log('Usuário da sessão:', user);

    // Buscar usuário no banco
    const dbUser = await prisma.user.findUnique({ 
      where: { 
        email: user.email! // Buscar por email em vez de ID
      } 
    });

    if (!dbUser) {
      console.log('Usuário não encontrado no banco');
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    console.log('Usuário encontrado:', dbUser.id);

    // Gerenciar customer do Stripe
    let stripeCustomerId = dbUser.stripeCustomerId;

    if (stripeCustomerId) {
      try {
        // Verificar se o customer existe no Stripe
        await stripe.customers.retrieve(stripeCustomerId);
        console.log('Customer válido:', stripeCustomerId);
      } catch (error) {
        console.log('Customer inválido, criando novo...', error);
        stripeCustomerId = null;
      }
    }

    if (!stripeCustomerId) {
      console.log('Criando novo customer...');
      const customer = await stripe.customers.create({ 
        email: user.email!,
        metadata: {
          userId: dbUser.id
        }
      });
      stripeCustomerId = customer.id;
      console.log('Novo customer criado:', stripeCustomerId);

      // Atualizar no banco
      await prisma.user.update({
        where: { id: dbUser.id },
        data: { stripeCustomerId: stripeCustomerId },
      });
      console.log('Customer ID salvo no banco');
    }

    // Criar checkout session
    console.log('Criando checkout session...');
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [{
        price: finalPriceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/dashboard?payment=cancel`,
      metadata: {
        userId: dbUser.id,
      },
    });

    console.log('Checkout session criada:', checkoutSession.id);
    console.log('=== FIM CHECKOUT API ===');

    return NextResponse.json({ sessionId: checkoutSession.id });

  } catch (error) {
    console.error('ERRO COMPLETO NA API:', error);
    
    // Retornar erro detalhado
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { error: `Erro interno: ${errorMessage}` },
      { status: 500 }
    );
  }
}