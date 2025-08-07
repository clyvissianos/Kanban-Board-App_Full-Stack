// src/dtos/BoardDto.ts
import type { ColumnDto } from './ColumnDto';

export interface BoardDto {
    id: number;
    name: string;
    description: string;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
    columns: ColumnDto[];
}
