import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BreakoutpropService } from './breakoutprop.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Controller('breakoutprop')
export class BreakoutpropController {
  constructor(private readonly breakoutpropService: BreakoutpropService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.breakoutpropService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.breakoutpropService.findAll();
  }

  @Get('leaderboard')
  getLeaderboard() {
    return this.breakoutpropService.getLeaderboard();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.breakoutpropService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.breakoutpropService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.breakoutpropService.remove(id);
  }
} 