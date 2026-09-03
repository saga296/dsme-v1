### Custom Currency Symbols
* Let admins toggle between Dollars, Euros, Pounds, Rupees, Yen, etc.
* I hardcoded Ð, realising much later that I should've created it as a configuration and let server admins choose themselves.

### Company Events
- Give companies fake, automated news headlines every once in a while (e.g., "XYZ Corp CEO caught sleeping on stream, stock drops 5%" or "ABC Inc. announces new product, stock surges 12%"). This injects artificial volatility.

### Periodic Market Closures
* Real-world stock exchanges close for a reason. Forced market closures build massive psychological anticipation for the "Opening Bell" (which will spike user activity right when markets reopen), force players to log off and touch grass, and give our server a breather.
* Our idea to rotate the closure times so it doesn't perpetually lock out a specific global timezone (e.g., always hitting peak US evening hours) is a masterstroke of fairness.
* While the stock market closes, keep the Bank and Loan timers running so players still have to sweat their debt obligations and interest collection while offline!

### Sector Categorization
* If a new player hears "Oil is doing great," they can filter by "Oil" to see only Zexxon, Shell-ish, etc. It turns the market from a wall of noise into manageable lists.

### Automated "Government"
* To prevent low-cap stocks from instantly dying or player economies from completely breaking due to wild manipulation, an automated Government steps in based on market triggers.
   * Circuit Breakers (Trading Halts): If a stock plummets by more than 50% at once, the "Government" halts trading on that specific stock for some time to let the panic subside. Though, market noise will continue to work.
   * Bailouts / Quantitative Easing: If a major blue-chip company crashes too hard, the government injects artificial liquidity, issuing a public headline ("Government passes bailout package for XYZ Corp"), which causes a sudden artificial price bounce.
* Why it's great: It adds a layer of hilarious socio-political commentary to oour town-square chat. Players will argue in chat about "government corruption," market manipulation, or demand bailouts for their favorite meme stocks.

---

### The Two-Tier Loan System

This dual-lending structure creates fantastic financial strategy for players:

#### Bank of Server
- The Vibe: A boring, reliable corporate bank.
- Rates: Low, steady interest rates (e.g., 5% to 8% fixed) that randomly shift every once in a while.
- Terms & Limits: Strict borrowing limits based on players' Net Worth and credit score. Generous repayment windows (e.g., 48 to 72 hours).
- The Purpose: Safe leverage for players who want to buy blue-chip dividend stocks or fund a calculated play without getting crushed by compounding interest.

#### Loan Shark
- The Vibe: Three shady, high-risk private lenders or venture sharks appearing on a dynamic marketplace board.
- Rates: Exorbitantly high interest rates (e.g., 25% to 50%), changing dynamically.
- Terms & Limits: Massive cash influxes with short, punishing repayment windows (e.g., 6 to 12 hours).
- The Purpose: Pure adrenaline. When a low-cap meme stock crashes 40% and a player knows it's about to bounce, they rush to the Private Pool to grab instant cash, YOLO into the dip, and pray they make enough profit to pay off the ruthless loan shark before the timer hits zero.

##### Liquidation

- If the timer expires and the player can't pay, the Liquidation Agent will empties their bank/wallet (and put them in negative if balance is not sufficient), and drops their credit score.