import { Module } from '@nestjs/common';
import { BreakoutpropService } from './breakoutprop.service';
import { BreakoutpropController } from './breakoutprop.controller';

@Module({
  controllers: [BreakoutpropController],
  providers: [BreakoutpropService],
  exports: [BreakoutpropService],
})
export class BreakoutpropModule {} 