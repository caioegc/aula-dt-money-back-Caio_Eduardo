// src/transaction/transaction.service.ts

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

  // MUDANÇA AQUI: findAll para retornar { data, totalCount, totalIncome, totalOutcome, total }
  async findAll(skip?: number, take?: number) {
    const transactions = await this.prisma.transaction.findMany({
      skip,
      take,
      orderBy: {
        data: 'desc',
      },
    });

    const totalCount = await this.prisma.transaction.count(); // Conta todas as transações

    // NOVO: Calcular os totais globais de entrada e saída
    const totalIncomeAggregation = await this.prisma.transaction.aggregate({
      _sum: {
        price: true,
      },
      where: {
        type: 'INCOME',
      },
    });

    const totalOutcomeAggregation = await this.prisma.transaction.aggregate({
      _sum: {
        price: true,
      },
      where: {
        type: 'OUTCOME',
      },
    });

    const totalIncome = totalIncomeAggregation._sum.price || 0;
    const totalOutcome = totalOutcomeAggregation._sum.price || 0;
    const total = totalIncome - totalOutcome;

    return {
      data: transactions,
      totalCount: totalCount,
      // NOVO: Incluir os totais globais na resposta
      totalIncome: totalIncome,
      totalOutcome: totalOutcome,
      total: total,
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

  // Correção: Adicionado 'async' à função remove
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