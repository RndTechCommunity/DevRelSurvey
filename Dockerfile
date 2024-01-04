FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

ARG NODE_VERSION=18.x
RUN curl --silent --location https://deb.nodesource.com/setup_$NODE_VERSION | bash - \
    && apt-get update \
    && apt-get install --yes nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /src
COPY . .

RUN dotnet restore

RUN dotnet publish "src/RndTech.DevRel.App/RndTech.DevRel.App.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0

EXPOSE 29500
ENV ASPNETCORE_URLS=http://*:29500

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "RndTech.DevRel.App.dll"]