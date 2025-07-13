import { Controller, Get } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  getGlobalLeaderboard() {
    return this.leaderboardService.getGlobalLeaderboard();
  }

  @Get('stats')
  getStats() {
    return this.leaderboardService.getStats();
  }
} 