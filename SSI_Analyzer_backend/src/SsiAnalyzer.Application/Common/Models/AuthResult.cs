namespace SsiAnalyzer.Application.Common.Models;

public record AuthResult(string Token, Guid UserId, string Email);
