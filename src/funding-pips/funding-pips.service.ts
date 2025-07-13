import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class FundingPipsService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    return this.prisma.fundingPips.create({
      data: createUserDto,
    });
  }

  async findAll() {
    return this.prisma.fundingPips.findMany({
      orderBy: { profit: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.fundingPips.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);

    return this.prisma.fundingPips.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.fundingPips.delete({
      where: { id },
    });
  }

  async getLeaderboard() {
    return this.prisma.fundingPips.findMany({
      orderBy: { profit: 'desc' },
      take: 10,
    });
  }
} 