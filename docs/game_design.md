# Abstract

- Name –> DSME (Discord Stock Market Economy)
- Scope –> Isolated Guilds (Not Global)
- Architecture –> Slash Commands
- Currency –> Ð (Dogecoin)

- Language –> Javascript
- Library –> Discord.js
- Database –> MongoDB

---

# Project Structure

```
dsme-v1/
├── src/
│   ├── commands/
│   │   ├── economy/
│   │   │   ├── buy.js
│   │   │   ├── sell.js
│   │   │   ├── portfolio.js
│   │   │   ├── work.js
│   │   │   ├── crime.js
│   │   │   ├── rob.js
│   │   │   ├── deposit.js
│   │   │   ├── withdraw.js
│   │   │   └── leaderboard.js
│   │   ├── market/
│   │   │   ├── speculate.js
│   │   │   └── dsme30.js
│   │   ├── admin/
│   │   │   └── reset.js
│   │   └── utility/
│   │       ├── donate.js
│   │       └── help.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Stock.js
│   │   ├── Transaction.js
│   │   └── MarketLog.js
│   ├── services/
│   │   ├── stockService.js
│   │   ├── marketService.js
│   │   ├── taxService.js
│   │   ├── dividendService.js
│   │   └── interestService.js
│   ├── utils/
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   └── logger.js
│   ├── events/
│   │   ├── ready.js
│   │   └── interactionCreate.js
│   └── index.js
├── config/
│   ├── database.js
│   └── config.js
└── .env
```

---

# Stock Market Logic

### Core Pricing Formula

 * Instead of matching buyers directly with sellers (an order book), players buy from and sell back to an algorithmic pool managed by the game.
 * Every time a player buys shares, the price goes up. Every time a player sells shares, the price goes down.

		Price = Base Price * (1+ NetSharesBought/LiquidityFactor)

### Stocks Tiers

- 15 Meme Stocks, ranging from 100 to 500 (base price) –> 2,500 Liquidity Factor
- 10 Growth Stocks, ranging from 501 to 2500 (base price) –> 25,000 Liquidity Factor
- 5 Blue Chip Stocks, ranging from 2501 to 5000 (base price) –> 100,000 Liquidity Factor 

### Safeguards

 * If a stock price drop to Ð0.00, Remove it from the database, issuing an announcement of its bankruptcy in announcements channel.
 * Add a tiny 2% trading fee on all buys and sells.

---

### Market Noise

 - Every 1 minute, a background script in the server can execute small, randomized "market noise" trades (micro-buys or micro-sells) for each company. (-1.5% to +1.5%)

### Performance Calculator

- Capture prices of all stocks and index fund at 12:00 AM IST everyday and calculate change in percentage of current price relative to this. (If missing, calculate against base price)
- Overwrite this price log everytime at 12 AM. No need to keep history.
-  Put the percentage, color-coded arrow to the each stock price and index fund (Green for Up, Red for Down).

---

# Core Mechanics

### RPG

- Income and risk commands (work, slut, crime, rob) to build capital, and invest in a player-driven stock market to multiply their wealth.
	- Work pay from 10 to 50. (Cooldown - 1 hour)
	- Crime pay from 120 to 180 but contain 0.6 probability of failure. And failure includes either "attempt wasted but no loss" or losing 100 for bribing the officer to flee. (Cooldown - 2 hour)
	- And rob contains 0.8 probability of failure and lose either 10% of cash for bail or flat 500, whichever is higher, upon failed attempt. (Cooldown - 3 hour)
- If someone successfully uses the rob command, they steal 30% percent of random user's wallet cash.

### Bank of Server
 * Players can deposit their cash into a secure bank account instead of keeping it in their wallet.
 * Safe from robbers, but locked away. It earns an 0.1% of interest and paid at 12:00 AM IST everyday.
 * Interest paid announcement in announcements channel.

---

# Features

### Dividends

 * Dividend pool based on the company's tier and paid at 12:00 AM everyday.
 * Blue chips pay steady 0.5%, Growth pay 1%; Memes pay 2%

### Taxation

- Calculated On total networth
- Taxed every day at 12:00 AM IST
 * 5 Tax Slabs
	 * 0 to 10,000 - Nil
	 * 10,001 to 50,000 - 5%
	 * 50,001 to 100,000 - 12%
	 * 100,001 to 500,000 - 18%
	 * 500,001+ - 28%
* Tax collected announcement in announcements channel

---

# Features 2.0

### Market Fund (DSME 30)

 * "Market Fund" that is a total price of all stocks.
 * Use /dsme30 command to gauge its performance.
 * The "Top 5 Gainers" and "Top 5 Losers" stocks.
### Player Leaderboard

 * The Top 10 Richest Players (by total Net Worth = Cash + Bank + Stocks - Loans).

---

# Server Admin Control

- Reset the whole economy
	- /reset