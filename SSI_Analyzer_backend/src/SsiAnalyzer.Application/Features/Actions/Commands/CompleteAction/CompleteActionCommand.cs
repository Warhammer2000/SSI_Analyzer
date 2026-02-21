using MediatR;

namespace SsiAnalyzer.Application.Features.Actions.Commands.CompleteAction;

public record CompleteActionCommand(Guid Id) : IRequest;
