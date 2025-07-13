import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FundedXService } from './funded-x.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Controller('funded-x')
export class FundedXController {
  constructor(private readonly fundedXService: FundedXService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.fundedXService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.fundedXService.findAll();
  }

  @Get('leaderboard')
  getLeaderboard() {
    return this.fundedXService.getLeaderboard();
  }

  @Get('enhanced-leaderboard')
  getEnhancedLeaderboard() {
    return this.fundedXService.getEnhancedLeaderboard();
  }

  @Post('sync')
  syncFromAPI() {
    return this.fundedXService.syncFromFundedXAPI();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fundedXService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.fundedXService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fundedXService.remove(id);
  }
} 