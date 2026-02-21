FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

# Copy solution and project files for restore
COPY SsiAnalyzer.slnx .
COPY src/SsiAnalyzer.Domain/SsiAnalyzer.Domain.csproj src/SsiAnalyzer.Domain/
COPY src/SsiAnalyzer.Application/SsiAnalyzer.Application.csproj src/SsiAnalyzer.Application/
COPY src/SsiAnalyzer.Infrastructure/SsiAnalyzer.Infrastructure.csproj src/SsiAnalyzer.Infrastructure/
COPY src/SsiAnalyzer.Api/SsiAnalyzer.Api.csproj src/SsiAnalyzer.Api/
RUN dotnet restore SsiAnalyzer.slnx

# Copy everything and build
COPY . .
RUN dotnet publish src/SsiAnalyzer.Api/SsiAnalyzer.Api.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview
WORKDIR /app
COPY --from=build /app .
EXPOSE 8080
ENTRYPOINT ["dotnet", "SsiAnalyzer.Api.dll"]
