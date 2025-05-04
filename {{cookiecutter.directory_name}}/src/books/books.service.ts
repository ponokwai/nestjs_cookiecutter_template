// [label /src/books/books.service.ts];

import { Injectable, HttpException } from '@nestjs/common';
import { BOOKS } from '../mocks/books.mock';
import { BookID, Book } from './books.types';
import { LoggerService } from '../observability/logger/logger.service';
import { Trace } from '../observability/decorators/trace.decorator';
import { TraceableClass } from '../observability/decorators/traceable-class.decorator';
import { MetricsService } from '../observability/metrics/metrics.service';
import * as promClient from 'prom-client';

@Injectable()
@TraceableClass()
export class BooksService {
  books = BOOKS;

  // Custom business metrics
  private booksCreatedCounter: promClient.Counter;
  private booksUpdatedCounter: promClient.Counter;
  private booksDeletedCounter: promClient.Counter;
  private booksRetrievedCounter: promClient.Counter;
  private booksCollectionSize: promClient.Gauge;

  constructor(
    private readonly logger: LoggerService,
    private readonly metricsService: MetricsService,
  ) {
    // Initialize metrics
    this.booksCreatedCounter = this.metricsService.createCounter(
      'books_created_total',
      'Total number of books created',
    );

    this.booksUpdatedCounter = this.metricsService.createCounter(
      'books_updated_total',
      'Total number of books updated',
    );

    this.booksDeletedCounter = this.metricsService.createCounter(
      'books_deleted_total',
      'Total number of books deleted',
    );

    this.booksRetrievedCounter = this.metricsService.createCounter(
      'books_retrieved_total',
      'Total number of book retrieval operations',
      ['operation'], // 'single' or 'collection'
    );

    this.booksCollectionSize = this.metricsService.createGauge(
      'books_collection_size',
      'Current number of books in the collection',
    );

    // Initialize the books collection size gauge
    this.booksCollectionSize.set(this.books.length);
  }

  @Trace('getBooks')
  getBooks(): Promise<Book[]> {
    // Increment retrieval counter
    this.booksRetrievedCounter.inc({ operation: 'collection' });

    return new Promise((resolve) => {
      resolve(this.books);
    });
  }

  @Trace('getBook')
  getBook(bookID: BookID): Promise<Book> {
    const id = Number(bookID);

    // Increment retrieval counter
    this.booksRetrievedCounter.inc({ operation: 'single' });

    return new Promise((resolve) => {
      const book = this.books.find((book) => book.id === id);
      if (!book) {
        throw new HttpException('Book does not exist!', 404);
      }
      resolve(book);
    });
  }

  @Trace('addBook')
  addBook(book: Book): Promise<Book> {
    return new Promise((resolve) => {
      if (!book.id) {
        book.id = this.books.length + 1;
      }
      this.books.push(book);

      // Increment book created counter
      this.booksCreatedCounter.inc();

      // Update collection size gauge
      this.booksCollectionSize.set(this.books.length);

      resolve(book);
    });
  }

  @Trace('updateBook')
  updateBook(bookID: BookID, book: Book): Promise<Book> {
    return new Promise((resolve) => {
      const bookIndex = this.books.findIndex((book) => book.id === bookID);
      if (bookIndex === -1) {
        throw new HttpException('Book does not exist!', 404);
      }
      this.books[bookIndex] = {
        id: bookID,
        title: book.title,
        description: book.description,
        author: book.author,
      } as Book;

      // Increment book updated counter
      this.booksUpdatedCounter.inc();

      resolve(this.books[bookIndex]);
    });
  }

  @Trace('deleteBook')
  deleteBook(bookID: BookID): Promise<{ message: string }> {
    return new Promise((resolve) => {
      const bookIndex = this.books.findIndex((book) => book.id === bookID);
      if (bookIndex === -1) {
        throw new HttpException('Book does not exist!', 404);
      }
      this.books.splice(bookIndex, 1);

      // Increment book deleted counter
      this.booksDeletedCounter.inc();

      // Update collection size gauge
      this.booksCollectionSize.set(this.books.length);

      resolve({ message: 'Book deleted successfully!' });
    });
  }
}
