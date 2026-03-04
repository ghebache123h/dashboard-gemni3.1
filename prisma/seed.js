const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Clearing old data...');
    await prisma.event.deleteMany();
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();

    console.log('Seeding data...');

    // Create Conversation 1 (Disney support, resolved)
    const conv1 = await prisma.conversation.create({
        data: {
            whatsappNum: '1234567890',
            status: 'closed',
            intent: 'disney_support',
            startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        }
    });

    await prisma.message.createMany({
        data: [
            { conversationId: conv1.id, role: 'user', content: 'I need a Disney OTP', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) },
            { conversationId: conv1.id, role: 'ai', content: 'Sure, what is your email?', inputTokens: 150, outputTokens: 50, createdAt: new Date(Date.now() - 1000 * 60 * 59 * 2) },
        ]
    });

    await prisma.event.create({
        data: {
            conversationId: conv1.id,
            eventType: 'OTP_REQUEST',
            createdAt: new Date(Date.now() - 1000 * 60 * 58 * 2)
        }
    });

    await prisma.event.create({
        data: {
            conversationId: conv1.id,
            eventType: 'OTP_SUCCESS',
            createdAt: new Date(Date.now() - 1000 * 60 * 55 * 2)
        }
    });

    // Create Conversation 2 (Escalated)
    const conv2 = await prisma.conversation.create({
        data: {
            whatsappNum: '0987654321',
            status: 'escalated',
            intent: 'general',
            startedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
        }
    });

    await prisma.message.createMany({
        data: [
            { conversationId: conv2.id, role: 'user', content: 'My account is blocked and OTP is not working!', createdAt: new Date(Date.now() - 1000 * 60 * 30) },
            { conversationId: conv2.id, role: 'ai', content: 'I am sorry to hear that. I will escalate this to a human agent.', inputTokens: 200, outputTokens: 80, createdAt: new Date(Date.now() - 1000 * 60 * 29) },
        ]
    });

    await prisma.event.create({
        data: {
            conversationId: conv2.id,
            eventType: 'ESCALATION',
            eventData: JSON.stringify({ reason: 'user_frustrated' }),
            createdAt: new Date(Date.now() - 1000 * 60 * 29)
        }
    });

    // Settings
    await prisma.settings.upsert({
        where: { id: 'default' },
        update: {},
        create: { inputTokenPrice: 0.50, outputTokenPrice: 1.50 }
    });

    console.log('Done seeding.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
