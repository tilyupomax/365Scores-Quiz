import { PrismaService } from '@/common/prisma/services';
import type { UserIdentifier } from '@/users/types';
import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput = {}): Promise<UserIdentifier> {
    const user = await this.prisma.user.create({ data });
    return { id: user.id };
  }

  async findById(id: string): Promise<UserIdentifier> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return { id: user.id };
  }
}
