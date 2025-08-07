using System.ComponentModel.DataAnnotations;

namespace Kanban.Api.DTOs
{
    public class RegisterDto
    {
        [Required, EmailAddress]
        public string Email { get; set; }

        [Required, MinLength(6)]
        public string Password { get; set; }

        [Required, Compare("Password")]
        public string ConfirmPassword { get; set; }

        [Required, MaxLength(100)]
        public string DisplayName { get; set; }
    }
}
