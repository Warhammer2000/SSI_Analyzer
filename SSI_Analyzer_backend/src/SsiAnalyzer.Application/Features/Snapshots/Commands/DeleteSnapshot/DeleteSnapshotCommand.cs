using MediatR;

namespace SsiAnalyzer.Application.Features.Snapshots.Commands.DeleteSnapshot;

public record DeleteSnapshotCommand(Guid Id) : IRequest;
