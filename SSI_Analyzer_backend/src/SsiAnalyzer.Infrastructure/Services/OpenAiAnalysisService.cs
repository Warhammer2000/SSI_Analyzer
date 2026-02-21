using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.SemanticKernel;
using SsiAnalyzer.Application.Common.Interfaces;
using SsiAnalyzer.Domain.Entities;

namespace SsiAnalyzer.Infrastructure.Services;

public class OpenAiAnalysisService : IAiAnalysisService
{
    private readonly IConfiguration _configuration;
    private readonly IAnalysisService _fallbackService;
    private readonly ILogger<OpenAiAnalysisService> _logger;

    public OpenAiAnalysisService(
        IConfiguration configuration,
        IAnalysisService fallbackService,
        ILogger<OpenAiAnalysisService> logger)
    {
        _configuration = configuration;
        _fallbackService = fallbackService;
        _logger = logger;
    }

    public async Task<List<Recommendation>> GeneratePersonalizedRecommendationsAsync(
        SsiSnapshot snapshot,
        string? industry,
        string? role,
        CancellationToken ct = default)
    {
        var apiKey = _configuration["OpenAI:ApiKey"];
        if (string.IsNullOrEmpty(apiKey))
        {
            _logger.LogWarning("OpenAI API key not configured, falling back to rule-based analysis");
            return _fallbackService.GenerateRecommendations(snapshot);
        }

        try
        {
            var model = _configuration["OpenAI:Model"] ?? "gpt-4o-mini";

            var builder = Kernel.CreateBuilder();
            builder.AddOpenAIChatCompletion(model, apiKey);
            var kernel = builder.Build();

            var prompt = BuildPrompt(snapshot, industry, role);

            var result = await kernel.InvokePromptAsync(prompt, cancellationToken: ct);
            var responseText = result.GetValue<string>() ?? "";

            var recommendations = ParseRecommendations(responseText, snapshot.Id);
            if (recommendations.Count > 0)
                return recommendations;

            _logger.LogWarning("Failed to parse AI recommendations, falling back to rule-based");
            return _fallbackService.GenerateRecommendations(snapshot);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "OpenAI analysis failed, falling back to rule-based");
            return _fallbackService.GenerateRecommendations(snapshot);
        }
    }

    private static string BuildPrompt(SsiSnapshot snapshot, string? industry, string? role)
    {
        return $$$"""
            You are an expert LinkedIn SSI (Social Selling Index) coach. Your job is to analyze SSI scores
            and explain them in a clear, human-friendly way — what each number means in practice,
            why it matters, and exactly what to do to improve.

            ## User's SSI Profile

            Total Score: {{{snapshot.TotalScore}}}/100
            - Establish Professional Brand: {{{snapshot.EstablishBrand}}}/25
            - Find the Right People: {{{snapshot.FindPeople}}}/25
            - Engage with Insights: {{{snapshot.EngageInsights}}}/25
            - Build Relationships: {{{snapshot.BuildRelationships}}}/25

            Industry: {{{industry ?? "Not specified"}}}
            Role: {{{role ?? "Not specified"}}}
            Industry Average SSI: {{{snapshot.IndustryAverage}}}
            Network Average SSI: {{{snapshot.NetworkAverage}}}
            Industry Rank: Top {{{snapshot.IndustryRankPercentile}}}%
            Network Rank: Top {{{snapshot.NetworkRankPercentile}}}%

            ## Instructions

            Provide exactly 4 recommendations — one for each SSI component. Prioritize by weakest score first (priority 1 = weakest area).

            For each recommendation:
            - **description**: Start by explaining what this SSI component measures and what the user's current score means in plain language. For example: "Your score of 3.1 out of 25 in Engage with Insights means you're barely interacting with content on LinkedIn. This component measures how often you share, comment on, and react to posts. At this level, the LinkedIn algorithm rarely shows your activity to others." Then give 2-3 sentences of specific, actionable advice.
            - **actionSteps**: 3-5 concrete daily/weekly actions the user can take right now.
            - **expectedImpact**: Realistic estimate of score improvement.
            - **timeEstimate**: How much time per day this takes.

            Write in a friendly, conversational tone. Avoid jargon. Be specific — no generic "post more content" advice.

            Respond in this exact JSON format:
            [
              {
                "component": "EstablishBrand|FindPeople|EngageInsights|BuildRelationships",
                "priority": 1,
                "title": "Short actionable title (max 8 words)",
                "description": "What this score means + specific advice (3-5 sentences)",
                "actionSteps": ["Concrete step 1", "Concrete step 2", "Concrete step 3"],
                "expectedImpact": "+X-Y points in Z weeks",
                "timeEstimate": "X min/day"
              }
            ]

            Return ONLY the JSON array, no other text.
            """;
    }

    private static List<Recommendation> ParseRecommendations(string responseText, Guid snapshotId)
    {
        try
        {
            // Extract JSON array from response
            var jsonStart = responseText.IndexOf('[');
            var jsonEnd = responseText.LastIndexOf(']');
            if (jsonStart == -1 || jsonEnd == -1)
                return [];

            var json = responseText[jsonStart..(jsonEnd + 1)];
            var items = JsonSerializer.Deserialize<List<AiRecommendationDto>>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (items is null)
                return [];

            return items.Select(item => new Recommendation
            {
                Id = Guid.NewGuid(),
                SnapshotId = snapshotId,
                Component = item.Component,
                Priority = item.Priority,
                Title = item.Title,
                Description = item.Description,
                ActionStepsJson = JsonSerializer.Serialize(item.ActionSteps),
                ExpectedImpact = item.ExpectedImpact,
                TimeEstimate = item.TimeEstimate,
                IsCompleted = false
            }).ToList();
        }
        catch
        {
            return [];
        }
    }

    private record AiRecommendationDto(
        string Component,
        int Priority,
        string Title,
        string Description,
        List<string> ActionSteps,
        string ExpectedImpact,
        string TimeEstimate
    );
}
