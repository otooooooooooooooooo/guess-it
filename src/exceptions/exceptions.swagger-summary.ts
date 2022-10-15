import { CustomExceptionType } from './exceptions.types';
import { CustomExceptionFilter, HttpSummary } from './exceptions.filter';
import { ApiResponseMetadata } from '@nestjs/swagger';

export function getSwaggerSummary(
  type: CustomExceptionType,
): Partial<ApiResponseMetadata> {
  const summary: HttpSummary = CustomExceptionFilter.getHttpSummary(type);
  return {
    status: summary.status,
    description: summary.message,
  };
}
