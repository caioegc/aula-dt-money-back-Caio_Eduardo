import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; 
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TransactionModule } from './modules/transaction/transaction.module';
import { PrismaModule } from './modules/prisma/prisma.module'; 

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
    }),
    PrismaModule, 
    TransactionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}