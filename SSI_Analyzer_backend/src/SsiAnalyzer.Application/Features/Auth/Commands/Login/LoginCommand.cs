using MediatR;
using SsiAnalyzer.Application.Common.Models;

namespace SsiAnalyzer.Application.Features.Auth.Commands.Login;

public record LoginCommand(string Email, string Password) : IRequest<AuthResult>;
