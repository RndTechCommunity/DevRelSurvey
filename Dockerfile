FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build

RUN curl --silent --location https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install --yes nodejs

WORKDIR /src
COPY . .

RUN dotnet restore

RUN dotnet publish "src/RndTech.DevRel.App/RndTech.DevRel.App.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:7.0

EXPOSE 29500
ENV ASPNETCORE_URLS=http://*:29500

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "RndTech.DevRel.App.dll"]