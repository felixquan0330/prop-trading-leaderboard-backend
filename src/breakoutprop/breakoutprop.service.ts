import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class BreakoutpropService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    return this.prisma.breakoutprop.create({
      data: createUserDto,
    });
  }

  async findAll() {
    return this.prisma.breakoutprop.findMany({
      orderBy: { profit: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.breakoutprop.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);

    return this.prisma.breakoutprop.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.breakoutprop.delete({
      where: { id },
    });
  }

  async getLeaderboard() {
    return this.prisma.breakoutprop.findMany({
      orderBy: { profit: 'desc' },
      take: 10,
    });
  }
} 