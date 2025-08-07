// src/dtos/CardDto.ts
export interface CardDto {
    id: number;
    title: string;
    description: string;
    order: number;
    columnId: number;
    createdAt: string;  // or Date if you parse it
    updatedAt: string;
}
