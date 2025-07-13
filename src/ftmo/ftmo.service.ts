import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class FtmoService {
  private readonly FTMO_API_URL = 'https://gw2.ftmo.com/tapi/stats/leaderboard';
  private readonly BEARER_TOKEN = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICIzSC03TGJsaThmRktCc0IyTEd5MDFXS1FsZ0xBXzR1bVJYdWhWdEZvVVlBIn0.eyJleHAiOjE3NTE1NDk3MzIsImlhdCI6MTc1MTU0OTQzMiwiYXV0aF90aW1lIjoxNzUxNTQzMzQxLCJqdGkiOiI3YmYwNTg0ZC04NjVmLTQxNDYtODJmNS0yN2QzYTBmZDVlOWIiLCJpc3MiOiJodHRwczovL3Nzby5mdG1vLmNvbS9hdXRoL3JlYWxtcy9GVE1PLUdsb2JhbCIsImF1ZCI6WyJmdG1vLXRyYWRlciIsImFjY291bnQiXSwic3ViIjoiY2ExYTE0NmMtN2EzYi00NWI4LWEzZGItNDczNTNmNGJlZjQzIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoiZnRtby10cmFkZXIiLCJzaWQiOiI0ZDVmMmQyOS1lYTZjLTQwM2ItODkwNy1hMGE3ZmE0YjRhOTgiLCJhY3IiOiIxIiwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iLCJkZWZhdWx0LXJvbGVzLWZ0bW8tZ2xvYmFsIiwiY3VzdG9tZXIiXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIHBob25lIGNvbXBhbnkiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmFtZSI6IlJpc2luZyBUYWxlbnQiLCJsYXN0X25hbWUiOiJUYWxlbnQiLCJsYWNhbGUiOiJlbiIsImZpcnN0X25hbWUiOiJSaXNpbmciLCJlbWFpbCI6InRzcC5maW4uZ3VydUBnbWFpbC5jb20iLCJjaWQiOjQ1OTc3NDcsImdyb3VwIjpbImZ0bW8tZXZhbC1nbG9iYWwiXX0.Mu4j9LMtOclR-Mp0IWc-krasiTvJ4JQtBQgLFcKBmCuj1CKp5YMDnwlpZgsVA7Gt0AYPErlvUz59kF2haCYurT4aBsy4naICMCT9JLuQ0HsJ_N0DUL89l9gMsikTSsTNd3XKHsHCzijkcSMsd2mwsKUWxUeRRlOvNdpgltBT8QFjwuvEZSCe2hEevN3EDV9HSz0MBgkviQkX59iRbGbbVYz2D7_za39RGOAfZYMKfm9GyiypK5p4mZkub1AkXFkZsAnREAzp2mo3En5vXQgLhY4wsjUib5JCPYLGWLC47ERFme4UHLLfJz1felTHqLJrqkU2uWON3eVkeX7iOXySig';

  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    return this.prisma.fTMO.create({
      data: createUserDto,
    });
  }

  async findAll() {
    return this.prisma.fTMO.findMany({
      orderBy: { profit: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.fTMO.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);

    return this.prisma.fTMO.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.fTMO.delete({
      where: { id },
    });
  }

  async getLeaderboard() {
    return this.prisma.fTMO.findMany({
      orderBy: { profit: 'desc' },
      take: 10,
    });
  }

  // New method to fetch and sync data from FTMO API
  async syncFromFTMOAPI() {
    try {
      const response = await fetch(this.FTMO_API_URL, {
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
      
      // Process global leaderboard data
      const globalTraders = data.data.GLOBAL || [];
      const challenge10Traders = data.data.CHALLENGE_10 || [];
      const challenge200Traders = data.data.CHALLENGE_200 || [];

      // Combine all traders and remove duplicates based on username
      const allTraders = [...globalTraders, ...challenge10Traders, ...challenge200Traders];
      const uniqueTraders = this.removeDuplicateTraders(allTraders);

      // Transform and save to database
      const savedTraders: any[] = [];
      for (const trader of uniqueTraders) {
        const userData = {
          username: trader.clientName,
          country: trader.clientCountryName || 'Unknown',
          profit: trader.profit || 0,
        };

        // Check if user already exists
        const existingUser = await this.prisma.fTMO.findUnique({
          where: { username: userData.username },
        });

        if (existingUser) {
          // Update existing user
          const updatedUser = await this.prisma.fTMO.update({
            where: { username: userData.username },
            data: {
              country: userData.country,
              profit: userData.profit,
            },
          });
          savedTraders.push(updatedUser);
        } else {
          // Create new user
          const newUser = await this.prisma.fTMO.create({
            data: userData,
          });
          savedTraders.push(newUser);
        }
      }

      return {
        message: `Successfully synced ${savedTraders.length} traders from FTMO API`,
        syncedCount: savedTraders.length,
        traders: savedTraders,
      };
    } catch (error) {
      console.error('Error syncing from FTMO API:', error);
      throw new Error(`Failed to sync from FTMO API: ${error.message}`);
    }
  }

  // Helper method to remove duplicate traders based on username
  private removeDuplicateTraders(traders: any[]): any[] {
    const uniqueTraders = new Map();
    
    for (const trader of traders) {
      if (trader.clientName && !uniqueTraders.has(trader.clientName)) {
        uniqueTraders.set(trader.clientName, trader);
      }
    }
    
    return Array.from(uniqueTraders.values());
  }

  // Method to get enhanced leaderboard with additional data
  async getEnhancedLeaderboard() {
    const traders = await this.prisma.fTMO.findMany({
      orderBy: { profit: 'desc' },
      take: 10,
    });

    return traders.map((trader, index) => ({
      rank: index + 1,
      username: trader.username,
      country: trader.country,
      profit: trader.profit,
      pnl: `+$${trader.profit.toLocaleString()}`,
      profitPercentage: this.calculateProfitPercentage(trader.profit),
      badges: this.generateBadges(trader.profit),
      verified: index < 3, // Top 3 are verified
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
    
    if (profit > 50000) {
      badges.push('🔥 Profit Streak');
      badges.push('🏆 Top Gun');
    } else if (profit > 30000) {
      badges.push('🔥 Profit Streak');
      badges.push('🎯 Sniper Entry');
    } else if (profit > 20000) {
      badges.push('🔥 Profit Streak');
      badges.push('📝 Consistency King');
    } else if (profit > 10000) {
      badges.push('📝 Consistency King');
    }
    
    return badges;
  }
} 