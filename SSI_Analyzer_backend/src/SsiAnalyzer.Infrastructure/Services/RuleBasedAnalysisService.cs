using System.Text.Json;
using SsiAnalyzer.Application.Common.Interfaces;
using SsiAnalyzer.Domain.Entities;

namespace SsiAnalyzer.Infrastructure.Services;

public class RuleBasedAnalysisService : IAnalysisService
{
    public List<Recommendation> GenerateRecommendations(SsiSnapshot snapshot)
    {
        var components = new[]
        {
            ("EstablishBrand", snapshot.EstablishBrand),
            ("FindPeople", snapshot.FindPeople),
            ("EngageInsights", snapshot.EngageInsights),
            ("BuildRelationships", snapshot.BuildRelationships)
        };

        var sorted = components.OrderBy(c => c.Item2).ToList();
        var recommendations = new List<Recommendation>();

        int priority = 1;
        foreach (var (component, score) in sorted)
        {
            var rec = GenerateForComponent(component, score, priority);
            if (rec != null)
            {
                recommendations.Add(rec);
                priority++;
            }
        }

        return recommendations;
    }

    public List<ActionItem> GenerateActionItems(SsiSnapshot snapshot, Guid userId)
    {
        var recommendations = GenerateRecommendations(snapshot);
        var actions = new List<ActionItem>();

        foreach (var rec in recommendations)
        {
            var steps = JsonSerializer.Deserialize<List<string>>(rec.ActionStepsJson) ?? [];
            foreach (var step in steps)
            {
                actions.Add(new ActionItem
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    Component = rec.Component,
                    Task = step,
                    Frequency = "daily",
                    IsCompleted = false,
                    DueDate = DateTime.UtcNow.Date
                });
            }
        }

        return actions;
    }

    private static Recommendation? GenerateForComponent(string component, double score, int priority)
    {
        return component switch
        {
            "EstablishBrand" => GenerateEstablishBrand(score, priority),
            "FindPeople" => GenerateFindPeople(score, priority),
            "EngageInsights" => GenerateEngageInsights(score, priority),
            "BuildRelationships" => GenerateBuildRelationships(score, priority),
            _ => null
        };
    }

    private static Recommendation GenerateEstablishBrand(double score, int priority)
    {
        string title, description, impact, time;
        List<string> actions;

        if (score < 5)
        {
            title = "Complete your LinkedIn profile";
            description = "Your professional brand is critically low. A complete profile is the foundation of LinkedIn presence.";
            actions = ["Add a professional headline with keywords", "Write a compelling About section (3+ paragraphs)", "Add your current role with detailed description", "Upload a professional profile photo"];
            impact = "+5-10 points in 1-2 weeks";
            time = "1 hour (one-time)";
        }
        else if (score < 10)
        {
            title = "Start publishing content";
            description = "Your profile needs more visibility. Publishing content establishes thought leadership.";
            actions = ["Write 1 LinkedIn article per week", "Share industry insights with your perspective", "Use relevant hashtags (3-5 per post)"];
            impact = "+3-5 points in 2 weeks";
            time = "30 min/week";
        }
        else if (score < 15)
        {
            title = "Optimize your content strategy";
            description = "Good start! Now focus on consistent high-quality content.";
            actions = ["Post 3-4 times per week", "Mix formats: text, images, documents", "Engage with comments on your posts within 1 hour"];
            impact = "+3-5 points in 2-3 weeks";
            time = "20 min/day";
        }
        else
        {
            title = "Maintain brand excellence";
            description = "Strong brand! Keep the momentum with advanced strategies.";
            actions = ["Create LinkedIn newsletters", "Collaborate on posts with industry leaders", "Repurpose top content in new formats"];
            impact = "+2-3 points in 3-4 weeks";
            time = "15 min/day";
        }

        return new Recommendation
        {
            Id = Guid.NewGuid(),
            Component = "EstablishBrand",
            Priority = priority,
            Title = title,
            Description = description,
            ActionStepsJson = JsonSerializer.Serialize(actions),
            ExpectedImpact = impact,
            TimeEstimate = time
        };
    }

    private static Recommendation GenerateFindPeople(double score, int priority)
    {
        string title, description, impact, time;
        List<string> actions;

        if (score < 5)
        {
            title = "Expand your network strategically";
            description = "Your network reach is very low. Start by connecting with people in your industry.";
            actions = ["Send 5 connection requests daily to industry peers", "Use LinkedIn search with filters for your industry", "Join 3-5 relevant LinkedIn groups"];
            impact = "+5-8 points in 2 weeks";
            time = "15 min/day";
        }
        else if (score < 10)
        {
            title = "Use advanced search techniques";
            description = "Good base network. Now use LinkedIn's tools to find decision-makers.";
            actions = ["Use Boolean search to find specific roles", "Save searches for key prospect profiles", "Connect with people who engaged with your content"];
            impact = "+3-5 points in 2 weeks";
            time = "15 min/day";
        }
        else if (score < 15)
        {
            title = "Leverage Sales Navigator features";
            description = "Solid network. Time to use advanced prospecting.";
            actions = ["Set up lead alerts for target accounts", "Use TeamLink to find warm introductions", "Review 'People Also Viewed' on prospect profiles"];
            impact = "+3-4 points in 2-3 weeks";
            time = "20 min/day";
        }
        else
        {
            title = "Master network discovery";
            description = "Excellent reach! Focus on quality over quantity.";
            actions = ["Build account maps for key targets", "Monitor job changes in your network", "Create lists for systematic outreach"];
            impact = "+2-3 points in 3-4 weeks";
            time = "10 min/day";
        }

        return new Recommendation
        {
            Id = Guid.NewGuid(),
            Component = "FindPeople",
            Priority = priority,
            Title = title,
            Description = description,
            ActionStepsJson = JsonSerializer.Serialize(actions),
            ExpectedImpact = impact,
            TimeEstimate = time
        };
    }

    private static Recommendation GenerateEngageInsights(double score, int priority)
    {
        string title, description, impact, time;
        List<string> actions;

        if (score < 5)
        {
            title = "Start commenting on industry posts";
            description = "Your engagement score is critically low. LinkedIn's algorithm rewards meaningful interactions.";
            actions = ["Comment on 5 posts daily", "Write 2-3 sentences, not just 'Great post'", "Focus on posts from industry leaders", "Like and react to 10+ posts daily"];
            impact = "+5-8 points in 2 weeks";
            time = "15 min/day";
        }
        else if (score < 10)
        {
            title = "Increase engagement depth";
            description = "You're engaging but need more depth. Quality comments drive visibility.";
            actions = ["Share posts with your own insights added", "Respond to all comments on your content", "Tag relevant people in your comments"];
            impact = "+3-5 points in 2 weeks";
            time = "20 min/day";
        }
        else if (score < 15)
        {
            title = "Become a thought contributor";
            description = "Good engagement! Now position yourself as a go-to voice.";
            actions = ["Start discussions with questions in your posts", "Share data and original insights", "Comment on trending industry topics early"];
            impact = "+3-4 points in 2-3 weeks";
            time = "15 min/day";
        }
        else
        {
            title = "Lead industry conversations";
            description = "Strong engagement! Maintain and expand your influence.";
            actions = ["Host LinkedIn Live events or Audio events", "Create polls to drive engagement", "Curate weekly industry roundups"];
            impact = "+2-3 points in 3-4 weeks";
            time = "15 min/day";
        }

        return new Recommendation
        {
            Id = Guid.NewGuid(),
            Component = "EngageInsights",
            Priority = priority,
            Title = title,
            Description = description,
            ActionStepsJson = JsonSerializer.Serialize(actions),
            ExpectedImpact = impact,
            TimeEstimate = time
        };
    }

    private static Recommendation GenerateBuildRelationships(double score, int priority)
    {
        string title, description, impact, time;
        List<string> actions;

        if (score < 5)
        {
            title = "Start conversations after connecting";
            description = "You're adding connections but not engaging. Send a follow-up message within 24 hours.";
            actions = ["Send 'Thanks for connecting' messages", "Ask one question about their work", "Reply to their recent posts after connecting"];
            impact = "+4-6 points in 2 weeks";
            time = "10 min/day";
        }
        else if (score < 10)
        {
            title = "Deepen existing connections";
            description = "Good start with messaging. Now build genuine relationships.";
            actions = ["Follow up on previous conversations", "Share relevant articles with connections", "Congratulate on job changes and achievements"];
            impact = "+3-5 points in 2 weeks";
            time = "15 min/day";
        }
        else if (score < 15)
        {
            title = "Nurture key relationships";
            description = "Solid relationship building. Focus on high-value connections.";
            actions = ["Schedule virtual coffee chats with key contacts", "Introduce connections who could benefit each other", "Endorse skills of your network contacts"];
            impact = "+3-4 points in 2-3 weeks";
            time = "15 min/day";
        }
        else
        {
            title = "Become a trusted advisor";
            description = "Excellent relationships! Position yourself as indispensable.";
            actions = ["Provide unprompted value to key accounts", "Share exclusive insights with your inner circle", "Recommend connections for opportunities"];
            impact = "+2-3 points in 3-4 weeks";
            time = "10 min/day";
        }

        return new Recommendation
        {
            Id = Guid.NewGuid(),
            Component = "BuildRelationships",
            Priority = priority,
            Title = title,
            Description = description,
            ActionStepsJson = JsonSerializer.Serialize(actions),
            ExpectedImpact = impact,
            TimeEstimate = time
        };
    }
}
