# DSME - Discord Stock Market Economy Bot

DSME is a comprehensive stock market economy bot for Discord servers.

## Features

- 💼 Full economy system with work, crime, and rob commands
- 📈 Realistic stock market with 30 unique stocks
- 🏦 Banking system with interest
- 💎 Dividend system
- 📊 Tax system
- 🏆 Player leaderboard
- 🔄 Dynamic market noise
- 📈 DSME 30 market index
- 🔒 Admin controls

## Commands

### Economy
- `/buy <symbol> <quantity>` - Buy stocks
- `/sell <symbol> <quantity>` - Sell stocks
- `/portfolio` - View your portfolio
- `/work` - Work to earn money
- `/crime` - Try your luck at crime
- `/rob` - Rob other players
- `/deposit <amount>` - Deposit to bank
- `/withdraw <amount>` - Withdraw from bank

### Market
- `/dsme30` - View market index
- `/speculate <symbol>` - View stock performance

### Utility
- `/leaderboard` - Top 10 richest players
- `/help` - Documentation
- `/donate` - Support the developer

### Admin
- `/reset` - Reset the economy (Admin only)

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Create `.env` file with your credentials
4. Run: `npm start`

## Environment Variables

```env
DISCORD_TOKEN=your_bot_token
MONGODB_URI=your_mongodb_uri
CLIENT_ID=your_client_id
GUILD_ID=your_guild_id
ANNOUNCEMENTS_CHANNEL_ID=your_announcements_channel
ADMIN_ROLE_ID=your_admin_role_id
```

## Support

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/saga296)

#### Developer Notes

- All the structural mechanics are written in [Game Design](docs/game_design.md). And the upcoming features to be added in v2 are mentioned in [v2 Blueprint](docs/v2_blueprint.md)
- Feel free to pull requests or fork this repository to add new features or to fix bugs.
- There's no live instance to test this. Please self-host first, before jumping into deployment.
