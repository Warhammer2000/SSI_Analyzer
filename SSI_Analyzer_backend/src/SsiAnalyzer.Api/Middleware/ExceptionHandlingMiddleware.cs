using System.Text.Json;
using FluentValidation;

namespace SsiAnalyzer.Api.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, message) = exception switch
        {
            ValidationException validationEx => (
                StatusCodes.Status400BadRequest,
                new { errors = validationEx.Errors.Select(e => new { e.PropertyName, e.ErrorMessage }) } as object
            ),
            UnauthorizedAccessException => (
                StatusCodes.Status401Unauthorized,
                new { error = exception.Message } as object
            ),
            KeyNotFoundException => (
                StatusCodes.Status404NotFound,
                new { error = exception.Message } as object
            ),
            InvalidOperationException => (
                StatusCodes.Status409Conflict,
                new { error = exception.Message } as object
            ),
            _ => (
                StatusCodes.Status500InternalServerError,
                new { error = "An unexpected error occurred" } as object
            )
        };

        if (statusCode == StatusCodes.Status500InternalServerError)
            _logger.LogError(exception, "Unhandled exception");
        else
            _logger.LogWarning(exception, "Handled exception: {Message}", exception.Message);

        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsync(JsonSerializer.Serialize(message, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        }));
    }
}
