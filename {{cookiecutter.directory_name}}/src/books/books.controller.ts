import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Query,
  Put,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDTO } from './dto/create-book.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { LoggerService } from '../observability/logger/logger.service';
import { Trace } from '../observability/decorators/trace.decorator';
import { TraceableClass } from '../observability/decorators/traceable-class.decorator';
import { MetricsService } from '../observability/metrics/metrics.service';
import * as promClient from 'prom-client';

@ApiTags('books')
@Controller('books')
@TraceableClass()
export class BooksController {
  // Performance metrics
  private bookOperationDuration: promClient.Histogram;
  private bookRequestErrors: promClient.Counter;

  constructor(
    private readonly booksService: BooksService,
    private readonly logger: LoggerService,
    private readonly metricsService: MetricsService,
  ) {
    // Initialize histogram for operation durations
    this.bookOperationDuration = this.metricsService.createHistogram(
      'book_operation_duration_seconds',
      'Duration of book operations in seconds',
      ['operation', 'method'],
      [0.01, 0.05, 0.1, 0.5, 1, 2, 5], // Custom buckets in seconds
    );

    // Error counter
    this.bookRequestErrors = this.metricsService.createCounter(
      'book_request_errors_total',
      'Total number of errors in book requests',
      ['operation', 'error_type'],
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all books' })
  @ApiResponse({ status: 200, description: 'Return all books.' })
  @Trace('getBooks')
  async getBooks() {
    const startTime = process.hrtime();

    try {
      const result = await this.booksService.getBooks();

      // Record operation duration
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const duration = seconds + nanoseconds / 1e9;
      this.bookOperationDuration.observe(
        { operation: 'getBooks', method: 'GET' },
        duration,
      );
      this.logger.log('Fetched all books successfully. Hurray!');

      return result;
    } catch (error) {
      // Record error with proper type handling
      this.bookRequestErrors.inc({
        operation: 'getBooks',
        error_type: error instanceof Error ? error.name : 'Unknown',
      });
      this.logger.error(
        {
          operation: 'getBooks',
          error: error instanceof Error ? error : String(error),
        },
        'Error fetching all books',
      );
      throw error;
    }
  }

  @Get('/:bookID')
  @ApiOperation({ summary: 'Get a book by ID' })
  @ApiResponse({ status: 200, description: 'Return a book.' })
  @ApiParam({
    name: 'bookID',
    required: true,
    description: 'ID of the book to retrieve',
  })
  @Trace('getBook')
  async getBook(@Param('bookID') bookID) {
    const startTime = process.hrtime();

    try {
      const bookIdNum = Number(bookID);
      const result = await this.booksService.getBook(bookIdNum);

      // Record operation duration
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const duration = seconds + nanoseconds / 1e9;
      this.bookOperationDuration.observe(
        { operation: 'getBook', method: 'GET' },
        duration,
      );

      return result;
    } catch (error) {
      // Record error with proper type handling
      this.bookRequestErrors.inc({
        operation: 'getBook',
        error_type: error instanceof Error ? error.name : 'Unknown',
      });
      throw error;
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a new book' })
  @ApiBody({ type: CreateBookDTO })
  @ApiResponse({
    status: 201,
    description: 'The book has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @Trace('addBook')
  async addBook(@Body() createBookDTO: CreateBookDTO) {
    const startTime = process.hrtime();

    try {
      const result = await this.booksService.addBook(createBookDTO);

      // Record operation duration
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const duration = seconds + nanoseconds / 1e9;
      this.bookOperationDuration.observe(
        { operation: 'addBook', method: 'POST' },
        duration,
      );

      return result;
    } catch (error) {
      // Record error with proper type handling
      this.bookRequestErrors.inc({
        operation: 'addBook',
        error_type: error instanceof Error ? error.name : 'Unknown',
      });
      throw error;
    }
  }

  @Delete()
  @ApiOperation({ summary: 'Delete a book by ID' })
  @ApiResponse({
    status: 200,
    description: 'The book has been successfully deleted.',
  })
  @ApiParam({
    name: 'bookID',
    required: true,
    description: 'ID of the book to delete',
  })
  @Trace('deleteBook')
  async deleteBook(@Query('bookID') bookID: string) {
    const startTime = process.hrtime();

    try {
      const bookIdNum = Number(bookID);
      const result = await this.booksService.deleteBook(bookIdNum);

      // Record operation duration
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const duration = seconds + nanoseconds / 1e9;
      this.bookOperationDuration.observe(
        { operation: 'deleteBook', method: 'DELETE' },
        duration,
      );

      return result;
    } catch (error) {
      // Record error with proper type handling
      this.bookRequestErrors.inc({
        operation: 'deleteBook',
        error_type: error instanceof Error ? error.name : 'Unknown',
      });
      throw error;
    }
  }

  @Put('/:bookID')
  @ApiOperation({ summary: 'Update a book by ID' })
  @ApiParam({
    name: 'bookID',
    required: true,
    description: 'ID of the book to update',
  })
  @ApiBody({ type: CreateBookDTO })
  @ApiResponse({
    status: 200,
    description: 'The book has been successfully updated.',
  })
  @Trace('updateBook')
  async updateBook(
    @Param('bookID') bookID: string,
    @Body() createBookDTO: CreateBookDTO,
  ) {
    const startTime = process.hrtime();

    try {
      const bookIdNum = Number(bookID);
      const result = await this.booksService.updateBook(
        bookIdNum,
        createBookDTO,
      );

      // Record operation duration
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const duration = seconds + nanoseconds / 1e9;
      this.bookOperationDuration.observe(
        { operation: 'updateBook', method: 'POST' },
        duration,
      );

      return result;
    } catch (error) {
      // Record error with proper type handling
      this.bookRequestErrors.inc({
        operation: 'updateBook',
        error_type: error instanceof Error ? error.name : 'Unknown',
      });
      throw error;
    }
  }
}
