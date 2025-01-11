import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { HttpExceptionFilter } from './http-exception.filter';
import { NotFoundException } from '@nestjs/common';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let response: Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HttpExceptionFilter],
    }).compile();

    filter = module.get<HttpExceptionFilter>(HttpExceptionFilter);
    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as any;
  });

  it('should return an error when http exception is thrown', () => {
    const exception = new NotFoundException('Resource not found');

    const host = {
      switchToHttp: jest
        .fn()
        .mockReturnValue({ getResponse: jest.fn().mockReturnValue(response) }),
    };

    filter.catch(exception, host as any);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({
      codigo: '404',
      mensagem: 'Resource not found',
    });
  });
});
