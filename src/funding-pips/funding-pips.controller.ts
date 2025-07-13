import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FundingPipsService } from './funding-pips.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Controller('funding-pips')
export class FundingPipsController {
  constructor(private readonly fundingPipsService: FundingPipsService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.fundingPipsService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.fundingPipsService.findAll();
  }

  @Get('leaderboard')
  getLeaderboard() {
    return this.fundingPipsService.getLeaderboard();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fundingPipsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.fundingPipsService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fundingPipsService.remove(id);
  }
} 