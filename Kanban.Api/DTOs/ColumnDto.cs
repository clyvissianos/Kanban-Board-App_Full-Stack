namespace Kanban.Api.DTOs
{
    public class ColumnDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int Order { get; set; }
        public int BoardId { get; set; }

        // Nested cards
        public List<CardDto> Cards { get; set; } = new();
    }
}
