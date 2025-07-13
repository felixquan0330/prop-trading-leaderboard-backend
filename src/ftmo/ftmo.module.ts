import { Module } from '@nestjs/common';
import { FtmoService } from './ftmo.service';
import { FtmoController } from './ftmo.controller';

@Module({
  controllers: [FtmoController],
  providers: [FtmoService],
  exports: [FtmoService],
})
export class FtmoModule {} 