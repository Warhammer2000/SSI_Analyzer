using SsiAnalyzer.Domain.Entities;
using SsiAnalyzer.Infrastructure.Services;
using FluentAssertions;

namespace SsiAnalyzer.UnitTests;

public class RuleBasedAnalysisServiceTests
{
    private readonly RuleBasedAnalysisService _service = new();

    [Fact]
    public void GenerateRecommendations_ShouldReturn4Recommendations_ForAnySnapshot()
    {
        var snapshot = CreateSnapshot(10, 10, 10, 10);

        var result = _service.GenerateRecommendations(snapshot);

        result.Should().HaveCount(4);
    }

    [Fact]
    public void GenerateRecommendations_ShouldPrioritizeWeakestComponent()
    {
        var snapshot = CreateSnapshot(20, 15, 3, 10);

        var result = _service.GenerateRecommendations(snapshot);

        result[0].Component.Should().Be("EngageInsights");
        result[0].Priority.Should().Be(1);
    }

    [Fact]
    public void GenerateRecommendations_CriticallyLowScore_ShouldGenerateHighPriorityRecs()
    {
        var snapshot = CreateSnapshot(2, 3, 1, 4);

        var result = _service.GenerateRecommendations(snapshot);

        result.Should().AllSatisfy(r =>
        {
            r.Title.Should().NotBeNullOrEmpty();
            r.Description.Should().NotBeNullOrEmpty();
            r.ActionStepsJson.Should().NotBe("[]");
            r.ExpectedImpact.Should().NotBeNullOrEmpty();
            r.TimeEstimate.Should().NotBeNullOrEmpty();
        });
    }

    [Fact]
    public void GenerateRecommendations_HighScores_ShouldStillProvideAdvice()
    {
        var snapshot = CreateSnapshot(22, 21, 23, 20);

        var result = _service.GenerateRecommendations(snapshot);

        result.Should().HaveCount(4);
        result.Should().AllSatisfy(r => r.Title.Should().NotBeNullOrEmpty());
    }

    [Fact]
    public void GenerateRecommendations_ShouldAssignSequentialPriorities()
    {
        var snapshot = CreateSnapshot(5, 10, 15, 20);

        var result = _service.GenerateRecommendations(snapshot);

        result.Select(r => r.Priority).Should().BeEquivalentTo([1, 2, 3, 4]);
    }

    [Fact]
    public void GenerateActionItems_ShouldCreateItemsFromRecommendations()
    {
        var snapshot = CreateSnapshot(3, 5, 8, 12);
        var userId = Guid.NewGuid();

        var result = _service.GenerateActionItems(snapshot, userId);

        result.Should().NotBeEmpty();
        result.Should().AllSatisfy(a =>
        {
            a.UserId.Should().Be(userId);
            a.Task.Should().NotBeNullOrEmpty();
            a.Component.Should().NotBeNullOrEmpty();
            a.Frequency.Should().Be("daily");
            a.IsCompleted.Should().BeFalse();
        });
    }

    [Fact]
    public void GenerateActionItems_ShouldHaveUniqueIds()
    {
        var snapshot = CreateSnapshot(5, 5, 5, 5);
        var userId = Guid.NewGuid();

        var result = _service.GenerateActionItems(snapshot, userId);

        result.Select(a => a.Id).Should().OnlyHaveUniqueItems();
    }

    private static SsiSnapshot CreateSnapshot(double brand, double people, double engage, double relationships)
    {
        return new SsiSnapshot
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            RecordedAt = DateTime.UtcNow,
            EstablishBrand = brand,
            FindPeople = people,
            EngageInsights = engage,
            BuildRelationships = relationships,
            IndustryAverage = 40,
            NetworkAverage = 35,
            IndustryRankPercentile = 50,
            NetworkRankPercentile = 60
        };
    }
}
