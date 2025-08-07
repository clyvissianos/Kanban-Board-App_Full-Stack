using System.ComponentModel.DataAnnotations;

namespace Kanban.Api.DTOs
{
    public class CreateColumnDto
    {
        [Required, MaxLength(100)]
        public string Name { get; set; }

        [Required]
        public int Order { get; set; }

        [Required]
        public int BoardId { get; set; }
    }
}
