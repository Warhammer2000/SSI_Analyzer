using SsiAnalyzer.Domain.Entities;

namespace SsiAnalyzer.Application.Common.Interfaces;

public interface ITokenService
{
    string GenerateToken(User user);
}
