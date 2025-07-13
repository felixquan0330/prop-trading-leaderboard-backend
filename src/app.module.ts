import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { BreakoutpropModule } from './breakoutprop/breakoutprop.module';
import { FtmoModule } from './ftmo/ftmo.module';
import { FundingPipsModule } from './funding-pips/funding-pips.module';
import { FundedXModule } from './funded-x/funded-x.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';

@Module({
  imports: [
    PrismaModule,
    BreakoutpropModule,
    FtmoModule,
    FundingPipsModule,
    FundedXModule,
    LeaderboardModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
