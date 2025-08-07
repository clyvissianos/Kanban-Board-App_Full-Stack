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
    public class ColumnsController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IMapper _mapper;

        public ColumnsController(AppDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        // GET: Columns
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ColumnDto>>> GetAll()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // Fetch only columns whose parent board belongs to this user
            var columns = await _db.Columns
                .Include(c => c.Cards)
                .Include(c => c.Board)
                .Where(c => c.Board.OwnerId == userId)
                .ToListAsync();

            return Ok(_mapper.Map<List<ColumnDto>>(columns));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ColumnDto>> Get(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var column = await _db.Columns
                .Include(c => c.Cards)
                .Include(c => c.Board)
                .FirstOrDefaultAsync(c => c.Id == id && c.Board.OwnerId == userId);

            if (column == null)
                return NotFound();

            return Ok(_mapper.Map<ColumnDto>(column));
        }

        [HttpPost]
        public async Task<ActionResult<ColumnDto>> Create(CreateColumnDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // Verify the target board exists and is owned by this user
            var board = await _db.Boards
                .FirstOrDefaultAsync(b => b.Id == dto.BoardId && b.OwnerId == userId);
            if (board == null)
                return BadRequest("Board not found or not owned by you.");

            // Map DTO to domain entity
            var column = _mapper.Map<Column>(dto);
            column.BoardId = dto.BoardId;

            _db.Columns.Add(column);
            await _db.SaveChangesAsync();

            var resultDto = _mapper.Map<ColumnDto>(column);
            return CreatedAtAction(nameof(Get), new { id = resultDto.Id }, resultDto);
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateColumnDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // Fetch the column including its parent board to check ownership
            var column = await _db.Columns
                .Include(c => c.Board)
                .FirstOrDefaultAsync(c => c.Id == id && c.Board.OwnerId == userId);

            if (column == null)
                return NotFound();

            await _db.SaveChangesAsync();
            return NoContent();
        }


        // GET: Columns/Delete/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var column = await _db.Columns
                .Include(c => c.Board)
                .FirstOrDefaultAsync(c => c.Id == id && c.Board.OwnerId == userId);

            if (column == null)
                return NotFound();

            _db.Columns.Remove(column);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
