using MediatR;

namespace SsiAnalyzer.Application.Features.Actions.Queries.GetStreak;

public record GetStreakQuery : IRequest<StreakResult>;

public record StreakResult(int CurrentStreak, int TotalCompletedActions);
