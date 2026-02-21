using MediatR;
using SsiAnalyzer.Domain.Entities;

namespace SsiAnalyzer.Application.Features.Actions.Queries.GetActions;

public record GetActionsQuery : IRequest<List<ActionItem>>;
