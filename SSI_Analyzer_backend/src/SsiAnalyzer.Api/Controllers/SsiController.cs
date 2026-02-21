using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SsiAnalyzer.Application.Features.Snapshots.Commands.CreateSnapshot;
using SsiAnalyzer.Application.Features.Snapshots.Commands.DeleteSnapshot;
using SsiAnalyzer.Application.Features.Snapshots.Queries.GetLatestSnapshot;
using SsiAnalyzer.Application.Features.Snapshots.Queries.GetSnapshots;
using SsiAnalyzer.Application.Features.Snapshots.Queries.GetTrends;

namespace SsiAnalyzer.Api.Controllers;

[ApiController]
[Route("api/ssi")]
[Authorize]
public class SsiController : ControllerBase
{
    private readonly ISender _sender;

    public SsiController(ISender sender) => _sender = sender;

    [HttpPost("snapshot")]
    public async Task<IActionResult> CreateSnapshot([FromBody] CreateSnapshotCommand command, CancellationToken ct)
    {
        var id = await _sender.Send(command, ct);
        return Ok(new { id });
    }

    [HttpGet("snapshots")]
    public async Task<IActionResult> GetSnapshots(CancellationToken ct)
    {
        var snapshots = await _sender.Send(new GetSnapshotsQuery(), ct);
        return Ok(snapshots);
    }

    [HttpGet("latest")]
    public async Task<IActionResult> GetLatest(CancellationToken ct)
    {
        var snapshot = await _sender.Send(new GetLatestSnapshotQuery(), ct);
        if (snapshot is null) return NotFound();
        return Ok(snapshot);
    }

    [HttpGet("trends")]
    public async Task<IActionResult> GetTrends(CancellationToken ct)
    {
        var trends = await _sender.Send(new GetTrendsQuery(), ct);
        return Ok(trends);
    }

    [HttpDelete("snapshot/{id:guid}")]
    public async Task<IActionResult> DeleteSnapshot(Guid id, CancellationToken ct)
    {
        await _sender.Send(new DeleteSnapshotCommand(id), ct);
        return NoContent();
    }
}
