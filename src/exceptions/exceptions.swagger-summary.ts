import { CustomExceptionType } from './exceptions.types';
import { CustomExceptionFilter, HttpSummary } from './exceptions.filter';
import { ApiResponseMetadata } from '@nestjs/swagger';

/**
 * Get swagger summary to pass in ApiResponse decorator
 * @param type
 */
export function getSwaggerSummary(
  type: CustomExceptionType,
): Partial<ApiResponseMetadata> {
  const summary: HttpSummary = CustomExceptionFilter.getHttpSummary(type);
  return {
    status: summary.status,
    description: summary.message,
  };
}
