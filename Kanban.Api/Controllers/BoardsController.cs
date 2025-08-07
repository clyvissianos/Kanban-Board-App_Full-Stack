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
    public class BoardsController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IMapper      _mapper;

        public BoardsController(AppDbContext db, IMapper mapper)
        {
            _db     = db;
            _mapper = mapper;
        }

        // GET api/boards
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BoardDto>>> GetAll()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var boards = await _db.Boards
                .Include(b => b.Columns)
                .ThenInclude(c => c.Cards)
                .Where(b => b.OwnerId == userId)
                .ToListAsync();

            return Ok(_mapper.Map<List<BoardDto>>(boards));
        }

        // GET api/boards/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<BoardDto>> Get(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var board = await _db.Boards
                                 .Include(b => b.Columns)
                                   .ThenInclude(c => c.Cards)
                                 .FirstOrDefaultAsync(b => b.Id == id && b.OwnerId == userId);

            if (board == null) return NotFound();

            return Ok(_mapper.Map<BoardDto>(board));
        }

        // POST api/boards
        [HttpPost]
        public async Task<ActionResult<BoardDto>> Create(CreateBoardDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var board = _mapper.Map<Board>(dto);
            board.OwnerId = userId;

            _db.Boards.Add(board);
            await _db.SaveChangesAsync();

            var result = _mapper.Map<BoardDto>(board);
            return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
        }

        // PUT api/boards/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateBoardDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var board = await _db.Boards.FindAsync(id);
            if (board == null || board.OwnerId != userId)
                return NotFound();

            _mapper.Map(dto, board);
            board.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        // DELETE api/boards/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var board = await _db.Boards.FindAsync(id);
            if (board == null || board.OwnerId != userId)
                return NotFound();

            _db.Boards.Remove(board);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
