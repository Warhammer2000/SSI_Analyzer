using MediatR;
using Microsoft.EntityFrameworkCore;
using SsiAnalyzer.Application.Common.Interfaces;
using SsiAnalyzer.Domain.Entities;

namespace SsiAnalyzer.Application.Features.Analysis.Commands.GenerateAnalysis;

public class GenerateAnalysisHandler : IRequestHandler<GenerateAnalysisCommand, List<Recommendation>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IAnalysisService _analysisService;
    private readonly IAiAnalysisService _aiAnalysisService;

    public GenerateAnalysisHandler(
        IApplicationDbContext db,
        ICurrentUserService currentUser,
        IAnalysisService analysisService,
        IAiAnalysisService aiAnalysisService)
    {
        _db = db;
        _currentUser = currentUser;
        _analysisService = analysisService;
        _aiAnalysisService = aiAnalysisService;
    }

    public async Task<List<Recommendation>> Handle(GenerateAnalysisCommand request, CancellationToken cancellationToken)
    {
        var snapshot = await _db.SsiSnapshots
            .Include(s => s.Recommendations)
            .FirstOrDefaultAsync(s => s.Id == request.SnapshotId && s.UserId == _currentUser.UserId!.Value, cancellationToken);

        if (snapshot is null)
            throw new KeyNotFoundException("Snapshot not found");

        // If recommendations already exist, return them (cached)
        if (snapshot.Recommendations.Count > 0)
            return snapshot.Recommendations.OrderBy(r => r.Priority).ToList();

        // Try AI-powered analysis first, fallback to rule-based
        var user = await _db.Users.FindAsync([_currentUser.UserId!.Value], cancellationToken);
        var recommendations = await _aiAnalysisService.GeneratePersonalizedRecommendationsAsync(
            snapshot, user?.Industry, user?.Role, cancellationToken);

        foreach (var rec in recommendations)
        {
            rec.SnapshotId = snapshot.Id;
        }

        _db.Recommendations.AddRange(recommendations);

        // Generate action items from rule-based service (more predictable)
        var actionItems = _analysisService.GenerateActionItems(snapshot, _currentUser.UserId!.Value);
        _db.ActionItems.AddRange(actionItems);

        await _db.SaveChangesAsync(cancellationToken);
        return recommendations.OrderBy(r => r.Priority).ToList();
    }
}
