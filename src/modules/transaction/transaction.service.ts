import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  async create({ category, data, price, title, type }: CreateTransactionDto) {
    const createdTransaction = await this.prisma.transaction.create({
      data: {
        title,
        category,
        data,
        price,
        type,
      },
    });
    return createdTransaction;
  }

  // MUDANÇA AQUI: findAll para retornar { data: transactions, totalCount: totalCount }
  async findAll(skip?: number, take?: number) {
    const transactions = await this.prisma.transaction.findMany({
      skip: skip,
      take: take,
      orderBy: {
        data: 'desc', // Ou 'createdAt' ou outro campo para ordenar as transações
      },
    });

    const totalCount = await this.prisma.transaction.count(); // NOVO: Conta todas as transações

    return {
      data: transactions,
      totalCount: totalCount,
    };
  }

  async findOne(id: string) {
    const foundTransaction = await this.prisma.transaction.findUnique({
      where: { id },
    });
    return foundTransaction;
  }

  async update(id: string, updateTransactionDto: UpdateTransactionDto) {
    const foundTransaction = await this.findOne(id);

    if (!foundTransaction) {
      throw new NotFoundException(`Transaction with id ${id} not found`);
    }

    const updatedTransaction = await this.prisma.transaction.update({
      where: { id },
      data: updateTransactionDto,
    });
    return updatedTransaction;
  }

  async remove(id: string) {
    const foundTransaction = await this.findOne(id);

    if (!foundTransaction) {
      throw new NotFoundException(`Transaction with ID "${id}" not found`);
    }

    await this.prisma.transaction.delete({
      where: { id },
    });
  }
}