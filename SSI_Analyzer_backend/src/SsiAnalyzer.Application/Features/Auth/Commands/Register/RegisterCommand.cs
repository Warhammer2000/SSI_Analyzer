using MediatR;
using SsiAnalyzer.Application.Common.Models;

namespace SsiAnalyzer.Application.Features.Auth.Commands.Register;

public record RegisterCommand(string Email, string Password) : IRequest<AuthResult>;
