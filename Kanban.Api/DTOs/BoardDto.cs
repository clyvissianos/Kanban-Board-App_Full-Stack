namespace Kanban.Api.DTOs
{
    public class BoardDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string OwnerId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Nested columns
        public List<ColumnDto> Columns { get; set; } = new();
    }
}
