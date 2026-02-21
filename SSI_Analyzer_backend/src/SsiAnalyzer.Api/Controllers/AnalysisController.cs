using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SsiAnalyzer.Application.Features.Analysis.Commands.GenerateAnalysis;
using SsiAnalyzer.Application.Features.Analysis.Queries.GetAnalysis;

namespace SsiAnalyzer.Api.Controllers;

[ApiController]
[Route("api/analysis")]
[Authorize]
public class AnalysisController : ControllerBase
{
    private readonly ISender _sender;

    public AnalysisController(ISender sender) => _sender = sender;

    [HttpPost("generate")]
    public async Task<IActionResult> Generate([FromBody] GenerateAnalysisCommand command, CancellationToken ct)
    {
        var recommendations = await _sender.Send(command, ct);
        return Ok(recommendations);
    }

    [HttpGet("{snapshotId:guid}")]
    public async Task<IActionResult> GetAnalysis(Guid snapshotId, CancellationToken ct)
    {
        var recommendations = await _sender.Send(new GetAnalysisQuery(snapshotId), ct);
        return Ok(recommendations);
    }
}
