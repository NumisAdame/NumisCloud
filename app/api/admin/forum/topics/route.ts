export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET: List all topics for admin with filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const topicRole = (session?.user as any)?.role;
    if (!session?.user?.id || (topicRole !== 'ADMIN' && topicRole !== 'MODERATOR')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');
    const filter = searchParams.get('filter'); // pinned, closed, official
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;

    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    if (filter === 'pinned') where.pinned = true;
    if (filter === 'closed') where.closed = true;
    if (filter === 'official') where.isOfficial = true;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [topics, total] = await Promise.all([
      prisma.forumTopic.findMany({
        where,
        orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          author: { select: { id: true, name: true } },
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { replies: true } },
        },
      }),
      prisma.forumTopic.count({ where }),
    ]);

    return NextResponse.json({
      topics,
      total,
      totalPages: Math.ceil(total / limit),
      page,
    });
  } catch (error: any) {
    console.error('Admin topics error:', error);
    return NextResponse.json({ error: 'Error al obtener temas' }, { status: 500 });
  }
}
