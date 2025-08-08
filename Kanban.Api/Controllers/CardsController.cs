using AutoMapper;
using Kanban.Api.Data;
using Kanban.Api.DTOs;
using Kanban.Api.Models;
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

        // **NEW** POST /api/cards
        [HttpPost]
        public async Task<ActionResult<CardDto>> Create(CreateCardDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // Optional: validate column exists and belongs to this user
            var column = await _db.Columns
                .Include(c => c.Board)
                .FirstOrDefaultAsync(c => c.Id == dto.ColumnId && c.Board.OwnerId == userId);
            if (column == null) return BadRequest("Invalid column");

            var card = _mapper.Map<Card>(dto);
            card.CreatedAt = DateTime.UtcNow;
            card.UpdatedAt = DateTime.UtcNow;

            _db.Cards.Add(card);
            await _db.SaveChangesAsync();

            // Optionally re-fetch with navigation for mapping
            var result = _mapper.Map<CardDto>(card);
            return CreatedAtAction(nameof(Get), new { id = card.Id }, result);
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
