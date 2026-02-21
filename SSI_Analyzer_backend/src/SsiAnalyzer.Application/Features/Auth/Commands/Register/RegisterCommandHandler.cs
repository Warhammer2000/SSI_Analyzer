using MediatR;
using Microsoft.EntityFrameworkCore;
using SsiAnalyzer.Application.Common.Interfaces;
using SsiAnalyzer.Application.Common.Models;
using SsiAnalyzer.Domain.Entities;

namespace SsiAnalyzer.Application.Features.Auth.Commands.Register;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, AuthResult>
{
    private readonly IApplicationDbContext _db;
    private readonly ITokenService _tokenService;
    private readonly IPasswordHasher _passwordHasher;

    public RegisterCommandHandler(IApplicationDbContext db, ITokenService tokenService, IPasswordHasher passwordHasher)
    {
        _db = db;
        _tokenService = tokenService;
        _passwordHasher = passwordHasher;
    }

    public async Task<AuthResult> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var exists = await _db.Users.AnyAsync(u => u.Email == request.Email, cancellationToken);
        if (exists)
            throw new InvalidOperationException("User with this email already exists");

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            PasswordHash = _passwordHasher.Hash(request.Password),
            CreatedAt = DateTime.UtcNow
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync(cancellationToken);

        var token = _tokenService.GenerateToken(user);
        return new AuthResult(token, user.Id, user.Email);
    }
}
