using System.ComponentModel.DataAnnotations;

namespace Kanban.Api.DTOs
{
    public class CreateBoardDto
    {
        [Required, MaxLength(100)]
        public string Name { get; set; }

        [MaxLength(500)]
        public string Description { get; set; }
    }
}
