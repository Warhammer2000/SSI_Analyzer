# Stage 1: Build frontend
FROM node:22-alpine AS frontend-build
WORKDIR /frontend
COPY ../SSI_Analyzer_frontend/package.json ../SSI_Analyzer_frontend/package-lock.json ./
RUN npm ci
COPY ../SSI_Analyzer_frontend/ .
RUN npm run build

# Stage 2: Build backend
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS backend-build
WORKDIR /src

# Copy project files for restore (Api project only, skip test projects)
COPY SSI_Analyzer_backend/src/SsiAnalyzer.Domain/SsiAnalyzer.Domain.csproj src/SsiAnalyzer.Domain/
COPY SSI_Analyzer_backend/src/SsiAnalyzer.Application/SsiAnalyzer.Application.csproj src/SsiAnalyzer.Application/
COPY SSI_Analyzer_backend/src/SsiAnalyzer.Infrastructure/SsiAnalyzer.Infrastructure.csproj src/SsiAnalyzer.Infrastructure/
COPY SSI_Analyzer_backend/src/SsiAnalyzer.Api/SsiAnalyzer.Api.csproj src/SsiAnalyzer.Api/
RUN dotnet restore src/SsiAnalyzer.Api/SsiAnalyzer.Api.csproj

# Copy everything and publish
COPY SSI_Analyzer_backend/ .
RUN dotnet publish src/SsiAnalyzer.Api/SsiAnalyzer.Api.csproj -c Release -o /app

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview
WORKDIR /app
COPY --from=backend-build /app .
COPY --from=frontend-build /frontend/dist ./wwwroot
EXPOSE 8080
ENTRYPOINT ["dotnet", "SsiAnalyzer.Api.dll"]
