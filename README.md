# ⚽ Sportinerd Live-score database Data Validation check service

## 🚀 API Endpoints


| Endpoint | Description | 
|----------|-------------|
| `GET /teams` | All teams from team collection|
| `GET /seasons/:seasonId/leagues/:leagueId/teams` | Team List of only those team who are playing that Season |
| `GET /rounds` | Total Rounds and starting, ending date of That rounds | 
| `GET /fixtures` | Upcoming matches | 
| `GET /seasons/:seasonId/leagues/:leagueId/squads` | Get All teams Squad list with players and coaches | 
| `GET /seasons/:seasonId/leagues/:leagueId/teams/:teamId` | Get A single Team Squad details with players and coaches| 


## 📅 GET /fixtures - Season Fixtures by Game Week

Returns paginated fixtures where each page represents a game week in the season.

### 🔗 Endpoint


### 📋 Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Game week number (each page = 1 game week) |


example req : `http://localhost:3000/fixtures?page=2`
### 📦 Response Structure
```json
{
    "success": true,
    "pagination": {
        "currentPage": 2,
        "totalPages": 38,
        "totalFixtures": 380
    },
    "data": [
        {
            "id": "688f4909bd4cf1cc53c2d4bb",
            "date": "2025-08-22T19:00:00.000Z",
            "homeTeam": "West Ham United",
            "awayTeam": "Chelsea"
        },
        {
            "id": "688f4908bd4cf1cc53c2d4b9",
            "date": "2025-08-23T11:30:00.000Z",
            "homeTeam": "Manchester City",
            "awayTeam": "Tottenham Hotspur"
        },
   ]
}
