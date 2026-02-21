using FluentValidation;

namespace SsiAnalyzer.Application.Features.Snapshots.Commands.CreateSnapshot;

public class CreateSnapshotValidator : AbstractValidator<CreateSnapshotCommand>
{
    public CreateSnapshotValidator()
    {
        RuleFor(x => x.EstablishBrand).InclusiveBetween(0, 25);
        RuleFor(x => x.FindPeople).InclusiveBetween(0, 25);
        RuleFor(x => x.EngageInsights).InclusiveBetween(0, 25);
        RuleFor(x => x.BuildRelationships).InclusiveBetween(0, 25);
        RuleFor(x => x.IndustryAverage).InclusiveBetween(0, 100);
        RuleFor(x => x.NetworkAverage).InclusiveBetween(0, 100);
        RuleFor(x => x.IndustryRankPercentile).InclusiveBetween(1, 100);
        RuleFor(x => x.NetworkRankPercentile).InclusiveBetween(1, 100);
        RuleFor(x => x.RecordedAt).NotEmpty();
    }
}
