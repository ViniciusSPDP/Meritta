// src/app/api/stripe/webhook/route.ts

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";
import prisma from "@/lib/prisma";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature') as string;

    let event: Stripe.Event;
    
    // --- BLOCO TRY...CATCH CORRIGIDO ---
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      // O erro é tratado como 'unknown' por padrão
      // Verificamos se é uma instância de um erro da Stripe
      if (err instanceof Stripe.errors.StripeError) {
        console.error(`❌ Erro na verificação da assinatura do Webhook: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
      }
      // Se for um erro de outro tipo, tratamos de forma genérica
      console.error('❌ Erro inesperado na verificação do webhook:', err);
      return NextResponse.json({ error: 'Ocorreu um erro inesperado.' }, { status: 500 });
    }
    // --- FIM DA CORREÇÃO ---

    // Usaremos um switch para lidar com cada tipo de evento
    switch (event.type) {
      
      // Evento principal: quando o checkout é finalizado e a assinatura começa.
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;

        console.log(`✅ Checkout completo. Iniciando assinatura ${subscriptionId}`);

        await prisma.user.update({
          where: {
            stripeCustomerId: customerId,
          },
          data: {
            stripeSubscriptionId: subscriptionId,
            stripeSubscriptionStatus: 'active',
            plan: 'PRO',
          },
        });
        break;
      }
      
      // Evento de ciclo de vida: quando uma assinatura é atualizada ou cancelada.
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const status = subscription.status;

        console.log(`Assinatura atualizada: ${subscription.id}, Novo Status: ${status}`);

        await prisma.user.update({
          where: {
            stripeCustomerId: customerId,
          },
          data: {
            stripeSubscriptionStatus: status,
            plan: status === 'active' ? 'PRO' : 'FREE',
          },
        });
        break;
      }

      default:
        // console.log(`Evento não tratado: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error("Erro no processamento do webhook:", error);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}