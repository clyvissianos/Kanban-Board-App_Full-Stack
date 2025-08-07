namespace Kanban.Api.Models
{
    public class Card
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int Order { get; set; }
        public int ColumnId { get; set; }
        public Column Column { get; set; }

        // Audit fields
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

    }
}
