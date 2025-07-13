import { Module } from '@nestjs/common';
import { FundingPipsService } from './funding-pips.service';
import { FundingPipsController } from './funding-pips.controller';

@Module({
  controllers: [FundingPipsController],
  providers: [FundingPipsService],
  exports: [FundingPipsService],
})
export class FundingPipsModule {} 