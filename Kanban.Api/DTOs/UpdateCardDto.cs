using System.ComponentModel.DataAnnotations;

namespace Kanban.Api.DTOs
{
    public class UpdateCardDto
    {
        [Required, MaxLength(200)]
        public string Title { get; set; }

        [MaxLength(1000)]
        public string Description { get; set; }

        [Required]
        public int Order { get; set; }
    }
}
