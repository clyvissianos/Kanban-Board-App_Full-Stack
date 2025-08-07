using AutoMapper;
using Kanban.Api.DTOs;
using Kanban.Api.Models;

namespace Kanban.Api.Helpers
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // ─────────── Board ───────────

            // Entity → Read DTO
            CreateMap<Board, BoardDto>();

            // Create DTO → Entity
            CreateMap<CreateBoardDto, Board>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.OwnerId, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.Columns, opt => opt.Ignore());

            // Update DTO → Entity
            CreateMap<UpdateBoardDto, Board>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.OwnerId, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.Columns, opt => opt.Ignore());

            // ─────────── Column ───────────

            // Entity → Read DTO
            CreateMap<Column, ColumnDto>();

            // Create DTO → Entity
            CreateMap<CreateColumnDto, Column>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Board, opt => opt.Ignore())
                .ForMember(dest => dest.Cards, opt => opt.Ignore());

            // Update DTO → Entity
            CreateMap<UpdateColumnDto, Column>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Board, opt => opt.Ignore())
                .ForMember(dest => dest.Cards, opt => opt.Ignore());

            // ─────────── Card ───────────

            // Entity → Read DTO
            CreateMap<Card, CardDto>();

            // Create DTO → Entity
            CreateMap<CreateCardDto, Card>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Column, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());

            // Update DTO → Entity
            CreateMap<UpdateCardDto, Card>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Column, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());
        }
    }
}
