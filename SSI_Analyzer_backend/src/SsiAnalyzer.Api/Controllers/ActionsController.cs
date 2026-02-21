using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SsiAnalyzer.Application.Features.Actions.Commands.CompleteAction;
using SsiAnalyzer.Application.Features.Actions.Queries.GetActions;
using SsiAnalyzer.Application.Features.Actions.Queries.GetStreak;

namespace SsiAnalyzer.Api.Controllers;

[ApiController]
[Route("api/actions")]
[Authorize]
public class ActionsController : ControllerBase
{
    private readonly ISender _sender;

    public ActionsController(ISender sender) => _sender = sender;

    [HttpGet]
    public async Task<IActionResult> GetActions(CancellationToken ct)
    {
        var actions = await _sender.Send(new GetActionsQuery(), ct);
        return Ok(actions);
    }

    [HttpPatch("{id:guid}/complete")]
    public async Task<IActionResult> CompleteAction(Guid id, CancellationToken ct)
    {
        await _sender.Send(new CompleteActionCommand(id), ct);
        return NoContent();
    }

    [HttpGet("streak")]
    public async Task<IActionResult> GetStreak(CancellationToken ct)
    {
        var streak = await _sender.Send(new GetStreakQuery(), ct);
        return Ok(streak);
    }
}
