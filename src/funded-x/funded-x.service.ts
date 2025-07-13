import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class FundedXService {
  private readonly FUNDEDX_API_URL = 'https://api.fundedx.com/dashboards/leaderboard/3?limit=10';
  private readonly BEARER_TOKEN = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtleUlkIn0.eyJzZXNzaW9uIjp7ImlkIjoiNjIwZGYwMzItOTE1MS00ZGVmLTg0N2ItOTdjYmZkYjhlZDAxIiwiZW1haWwiOiJtaW5pYmVhcjk1NUBnbWFpbC5jb20iLCJmaXJzdE5hbWUiOiJGZWxpeCIsImxhc3ROYW1lIjoiUXVhbiIsInJvbGVzIjpbImN1c3RvbWVyIl19LCJzdWIiOiI2MjBkZjAzMi05MTUxLTRkZWYtODQ3Yi05N2NiZmRiOGVkMDEiLCJpc3MiOiJDSEFOR0VNRSIsInJlZmVycmFsQ29kZSI6IiIsImlhdCI6MTc1MTU1MTg0NywiZXhwIjoxNzUyMTU2NjQ3fQ.RpdEF10n6LNdaADv_2zINCnMF9v_lAcFdR_fjhSXKQi3DpZXdVbl0uOVgpUmtGqVYyqhCF-DADkwBcASRK8O2VSmcuf9VLAoDHbOgWtPXiYvYWbEwP3i1UrNfJVcsq4EBv_mry9YvJncfCizI-e-qoTPUsLt7oNv5-4X76yd1zMHcN2oI-3qwADl5mXrqshe122kA6nVi3STccytgUcrDhoI2CPrvCcgDSOEYRcGW5Q8a_i1P9cOsUmWMvksXvDAmnKfzMF96GhxrqOuN0LeJXjUbYc_IFAa8qPEjRhk2g2UGnnm0ra3TOwHu9wpyIfcsyUtDqzF4x1ZqMMyxrN3nKi25vk8BTHprzfcKoYfU5lyZ1Sx-aYHLD9bZt9jA7nIoaDYQK7eKJ6SKNFQ8qy4tYXuh-LQYQkYV91a6lYXGAKDMefF9Za4c5FzZ7wePUg2RbQENgVaL8RqksfyLnyx003S1f7k4_me8WwzgSXNsSQAqz4zSVUDzcpHXujph7HTP1o9clmaanHvcZyBBBAzwXRsTQeH3DgaAL4qb89Gzx0Nov7mBgxvgXEeTd8BhyS3yEIOnSDYQRGP_pYojIZn8jN5A6CES2wjeV32kliIK4sHHL8owkwl4ZxOp-POj04WC_OeZumYO4BzDzknik7mfTLEjjZZzAz7vpnt-ESr61I';

  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    return this.prisma.fundedX.create({
      data: createUserDto,
    });
  }

  async findAll() {
    return this.prisma.fundedX.findMany({
      orderBy: { profit: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.fundedX.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);

    return this.prisma.fundedX.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.fundedX.delete({
      where: { id },
    });
  }

  async getLeaderboard() {
    return this.prisma.fundedX.findMany({
      orderBy: { profit: 'desc' },
      take: 10,
    });
  }

  // New method to fetch and sync data from FundedX API
  async syncFromFundedXAPI() {
    try {
      const response = await fetch(this.FUNDEDX_API_URL, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.BEARER_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Process leaderboard data
      const traders = data.data || [];

      // Transform and save to database
      const savedTraders: any[] = [];
      for (const trader of traders) {
        const userData = {
          username: trader.shortName,
          country: 'Unknown', // FundedX API doesn't provide country info
          profit: trader.profit || 0,
        };

        // Check if user already exists
        const existingUser = await this.prisma.fundedX.findUnique({
          where: { username: userData.username },
        });

        if (existingUser) {
          // Update existing user
          const updatedUser = await this.prisma.fundedX.update({
            where: { username: userData.username },
            data: {
              country: userData.country,
              profit: userData.profit,
            },
          });
          savedTraders.push(updatedUser);
        } else {
          // Create new user
          const newUser = await this.prisma.fundedX.create({
            data: userData,
          });
          savedTraders.push(newUser);
        }
      }

      return {
        message: `Successfully synced ${savedTraders.length} traders from FundedX API`,
        syncedCount: savedTraders.length,
        traders: savedTraders,
      };
    } catch (error) {
      console.error('Error syncing from FundedX API:', error);
      throw new Error(`Failed to sync from FundedX API: ${error.message}`);
    }
  }

  // Method to get enhanced leaderboard with additional data
  async getEnhancedLeaderboard() {
    const traders = await this.prisma.fundedX.findMany({
      orderBy: { profit: 'desc' },
      take: 10,
    });

    return traders.map((trader, index) => ({
      rank: index + 1,
      username: trader.username,
      country: trader.country,
      countryCode: 'Unknown', // FundedX doesn't provide country codes
      profit: trader.profit,
      pnl: `+$${trader.profit.toLocaleString()}`,
      profitPercentage: this.calculateProfitPercentage(trader.profit),
      deposit: 10000, // Mock deposit since FundedX API doesn't provide this
      equity: trader.profit + 10000, // Mock equity calculation
      badges: this.generateBadges(trader.profit),
      verified: index < 3, // Top 3 are verified
      daysTraded: 30, // Mock days traded
      back: false, // Mock back status
      createdAt: trader.createdAt,
      updatedAt: trader.updatedAt,
    }));
  }

  // Helper method to calculate profit percentage (mock calculation)
  private calculateProfitPercentage(profit: number): number {
    // This is a mock calculation - in real scenario you'd have deposit/equity data
    const baseDeposit = 10000; // Mock base deposit
    return (profit / baseDeposit) * 100;
  }

  // Helper method to generate badges based on profit
  private generateBadges(profit: number): string[] {
    const badges: string[] = [];
    const profitPercentage = this.calculateProfitPercentage(profit);
    
    if (profitPercentage > 50) {
      badges.push('🔥 Profit Streak');
      badges.push('🏆 Top Gun');
    } else if (profitPercentage > 30) {
      badges.push('🔥 Profit Streak');
      badges.push('🎯 Sniper Entry');
    } else if (profitPercentage > 20) {
      badges.push('🔥 Profit Streak');
      badges.push('📝 Consistency King');
    } else if (profitPercentage > 10) {
      badges.push('📝 Consistency King');
    }
    
    return badges;
  }
} 