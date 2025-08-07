using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace Kanban.Api.Models
{
    public class ApplicationUser : IdentityUser
    {
        [Required]
        [MaxLength(100)]
        public string DisplayName { get; set; }

        /// A short bio or “about me” for user profiles
        [MaxLength(500)]
        public string? Bio { get; set; }

        /// Optional avatar image URL
        [Url]
        public string? AvatarUrl { get; set; }


        //— Auditing -------------------------------------------------------------

        /// When the user first registered
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

        /// Last time they successfully logged in
        public DateTime? LastLoginAt { get; set; }


        //— Navigation properties ----------------------------------------------

        /// The Boards this user owns
        public ICollection<Board> Boards { get; set; } = new List<Board>();
    }
}
