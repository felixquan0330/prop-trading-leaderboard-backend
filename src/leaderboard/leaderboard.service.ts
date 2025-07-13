import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeaderboardService {
  constructor(private prisma: PrismaService) {}

  async getGlobalLeaderboard() {
    const [breakoutprop, ftmo, fundingPips, fundedX] = await Promise.all([
      this.prisma.breakoutprop.findMany({
        orderBy: { profit: 'desc' },
        take: 10,
        select: {
          id: true,
          username: true,
          country: true,
          profit: true,
          createdAt: true,
        },
      }),
      this.prisma.fTMO.findMany({
        orderBy: { profit: 'desc' },
        take: 10,
        select: {
          id: true,
          username: true,
          country: true,
          profit: true,
          createdAt: true,
        },
      }),
      this.prisma.fundingPips.findMany({
        orderBy: { profit: 'desc' },
        take: 10,
        select: {
          id: true,
          username: true,
          country: true,
          profit: true,
          createdAt: true,
        },
      }),
      this.prisma.fundedX.findMany({
        orderBy: { profit: 'desc' },
        take: 10,
        select: {
          id: true,
          username: true,
          country: true,
          profit: true,
          createdAt: true,
        },
      }),
    ]);

    // Combine all results and add firm information
    const combinedResults = [
      ...breakoutprop.map(user => ({ ...user, firm: 'Breakoutprop' })),
      ...ftmo.map(user => ({ ...user, firm: 'FTMO' })),
      ...fundingPips.map(user => ({ ...user, firm: 'Funding Pips' })),
      ...fundedX.map(user => ({ ...user, firm: 'Funded X' })),
    ];

    // Sort by profit in descending order
    return combinedResults.sort((a, b) => b.profit - a.profit);
  }

  async getStats() {
    const [breakoutpropCount, ftmoCount, fundingPipsCount, fundedXCount] = await Promise.all([
      this.prisma.breakoutprop.count(),
      this.prisma.fTMO.count(),
      this.prisma.fundingPips.count(),
      this.prisma.fundedX.count(),
    ]);

    const [breakoutpropTotal, ftmoTotal, fundingPipsTotal, fundedXTotal] = await Promise.all([
      this.prisma.breakoutprop.aggregate({
        _sum: { profit: true },
      }),
      this.prisma.fTMO.aggregate({
        _sum: { profit: true },
      }),
      this.prisma.fundingPips.aggregate({
        _sum: { profit: true },
      }),
      this.prisma.fundedX.aggregate({
        _sum: { profit: true },
      }),
    ]);

    return {
      totalUsers: breakoutpropCount + ftmoCount + fundingPipsCount + fundedXCount,
      firms: {
        Breakoutprop: {
          users: breakoutpropCount,
          totalProfit: breakoutpropTotal._sum.profit || 0,
        },
        FTMO: {
          users: ftmoCount,
          totalProfit: ftmoTotal._sum.profit || 0,
        },
        'Funding Pips': {
          users: fundingPipsCount,
          totalProfit: fundingPipsTotal._sum.profit || 0,
        },
        'Funded X': {
          users: fundedXCount,
          totalProfit: fundedXTotal._sum.profit || 0,
        },
      },
    };
  }
} 