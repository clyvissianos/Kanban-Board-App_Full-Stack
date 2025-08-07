using System.ComponentModel.DataAnnotations;

namespace Kanban.Api.DTOs
{
    public class UpdateColumnDto
    {
        [Required, MaxLength(100)]
        public string Name { get; set; }

        [Required]
        public int Order { get; set; }
    }
}
