import { Module } from '@nestjs/common';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { ObservabilityModule } from '../observability/observability.module';

@Module({
  imports: [ObservabilityModule.forRoot()],
  controllers: [BooksController],
  providers: [BooksService],
})
export class BooksModule {}
