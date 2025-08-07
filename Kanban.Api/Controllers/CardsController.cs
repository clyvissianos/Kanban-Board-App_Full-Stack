using AutoMapper;
using Kanban.Api.Data;
using Kanban.Api.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Kanban.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CardsController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IMapper _mapper;

        public CardsController(AppDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        // GET: Cards
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CardDto>>> GetAll()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var cards = await _db.Cards
                .Include(c => c.Column)
                .ThenInclude(col => col.Board)
                .Where(c => c.Column.Board.OwnerId == userId)
                .ToListAsync();

            return Ok(_mapper.Map<List<CardDto>>(cards));
        }

        // GET: Cards/Details/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CardDto>> Get(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var card = await _db.Cards
                .Include(c => c.Column)
                .ThenInclude(col => col.Board)
                .FirstOrDefaultAsync(c => c.Id == id && c.Column.Board.OwnerId == userId);

            if (card == null)
                {
                return NotFound();
            }

            return Ok(_mapper.Map<CardDto>(card));
        }

        // GET: Cards/Create
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateCardDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // Fetch the card including its column & board to check ownership
            var card = await _db.Cards
                .Include(c => c.Column)
                    .ThenInclude(col => col.Board)
                .FirstOrDefaultAsync(c => c.Id == id && c.Column.Board.OwnerId == userId);

            if (card == null)
                return NotFound();

            // Map only the updatable fields
            _mapper.Map(dto, card);
            card.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var card = await _db.Cards
                .Include(c => c.Column)
                    .ThenInclude(col => col.Board)
                .FirstOrDefaultAsync(c => c.Id == id && c.Column.Board.OwnerId == userId);

            if (card == null)
                return NotFound();

            _db.Cards.Remove(card);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
