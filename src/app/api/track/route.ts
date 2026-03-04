import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            type, // 'message' | 'event'
            conversationId,
            status = 'open',
            intent,
            role, // user, ai, system
            content,
            inputTokens = 0,
            outputTokens = 0,
            eventType,
            eventData
        } = body;

        if (!conversationId) {
            return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
        }

        // 1. Ensure conversation exists / Update it
        const conversation = await prisma.conversation.upsert({
            where: { id: conversationId },
            update: {
                status: status,
                ...(intent ? { intent } : {}),
            },
            create: {
                id: conversationId,
                status: status,
                intent: intent || null,
            }
        });

        // 2. Log Message if applicable
        if (type === 'message' && role) {
            await prisma.message.create({
                data: {
                    conversationId,
                    role,
                    content,
                    inputTokens: parseInt(inputTokens) || 0,
                    outputTokens: parseInt(outputTokens) || 0,
                }
            });
        }

        // 3. Log Event if applicable
        if (type === 'event' && eventType) {
            await prisma.event.create({
                data: {
                    conversationId,
                    eventType,
                    eventData: eventData ? eventData : null,
                }
            });
        }

        return NextResponse.json({ success: true, conversationId }, { status: 200 });

    } catch (error: any) {
        console.error('Tracking API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
