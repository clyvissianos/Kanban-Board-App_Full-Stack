// src/dtos/ColumnDto.ts
import type { CardDto } from './CardDto';

export interface ColumnDto {
    id: number;
    name: string;
    order: number;
    boardId: number;
    cards: CardDto[];
}
