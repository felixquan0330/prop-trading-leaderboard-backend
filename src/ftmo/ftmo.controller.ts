import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FtmoService } from './ftmo.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Controller('ftmo')
export class FtmoController {
  constructor(private readonly ftmoService: FtmoService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.ftmoService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.ftmoService.findAll();
  }

  @Get('leaderboard')
  getLeaderboard() {
    return this.ftmoService.getLeaderboard();
  }

  @Get('enhanced-leaderboard')
  getEnhancedLeaderboard() {
    return this.ftmoService.getEnhancedLeaderboard();
  }

  @Post('sync')
  syncFromAPI() {
    return this.ftmoService.syncFromFTMOAPI();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ftmoService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.ftmoService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ftmoService.remove(id);
  }
} 