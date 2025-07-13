import { Module } from '@nestjs/common';
import { FundedXService } from './funded-x.service';
import { FundedXController } from './funded-x.controller';

@Module({
  controllers: [FundedXController],
  providers: [FundedXService],
  exports: [FundedXService],
})
export class FundedXModule {} 