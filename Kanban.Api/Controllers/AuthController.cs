using Kanban.Api.DTOs;
using Kanban.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;



namespace Kanban.Api.Controllers
{
    /// <summary>
    /// Handles user registration and login, issuing JWTs for authenticated clients.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IConfiguration _config;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            IConfiguration config)
        {
            _userManager = userManager;
            _config = config;
        }

        /// <summary>
        /// Registers a new user account.
        /// POST: /api/auth/register
        /// </summary>
        /// <param name="dto">Email, Password, ConfirmPassword, DisplayName</param>
        /// <returns>201 Created on success; 400 with errors otherwise.</returns>
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Create the ApplicationUser
            var user = new ApplicationUser
            {
                UserName = dto.Email,
                Email = dto.Email,
                DisplayName = dto.DisplayName,
                JoinedAt = DateTime.UtcNow
            };

            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
            {
                // Aggregate identity errors into the response
                foreach (var err in result.Errors)
                    ModelState.AddModelError(err.Code, err.Description);
                return BadRequest(ModelState);
            }

            // Optionally, sign in the user here or return 201 with no body
            return StatusCode(201);
        }

        /// <summary>
        /// Logs in an existing user and returns a JWT.
        /// POST: /api/auth/login
        /// </summary>
        /// <param name="dto">Email and Password</param>
        /// <returns>
        /// 200 OK with <see cref="AuthResponseDto"/> containing the token and user info;  
        /// 401 Unauthorized on failure.
        /// </returns>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Find the user by email
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
                return Unauthorized("Invalid credentials.");

            // Check the password
            if (!await _userManager.CheckPasswordAsync(user, dto.Password))
                return Unauthorized("Invalid credentials.");

            // Generate JWT
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"]);
            var expires = DateTime.UtcNow.AddHours(2);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id),
                    new Claim(ClaimTypes.Email,          user.Email),
                    new Claim("displayName",             user.DisplayName)
                }),
                Expires = expires,
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var jwt = tokenHandler.WriteToken(token);

            // Return the token and some basic user info
            var response = new AuthResponseDto
            {
                Token = jwt,
                Expires = expires,
                UserId = user.Id,
                Email = user.Email,
                DisplayName = user.DisplayName
            };

            return Ok(response);
        }
    }
}

