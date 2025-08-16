Turn-Based ActionsEach player performs one action per turn, simultaneously:Move and Mine: Choose ChainA (Base testnet) to mine ResourceA (Attack += 1 + rand(0,2)) or ChainB (Arbitrum One testnet) to mine ResourceB (Defense += 1 + rand(0,2)), and claim 1 zone (out of 5 per chain).

Action execution:Player calls StarForgeOApp on the target chain (ChainA or ChainB).
OApp updates local zoneControl (e.g., UserA claims 1 zone on ChainA).
OApp uses composer to send message to Hub Chain to inform action done. No lzread needed here. just simple updates

Off-Chain Aggregation with Multiple lzRead Calls:The off-chain server (using a server wallet) makes two lzRead calls:Fetch zoneControl from ChainA’s StarForgeOApp (5 zones, e.g., UserA owns 2, UserB owns 1).
Fetch zoneControl from ChainB’s StarForgeOApp (e.g., UserA owns 0, UserB owns 1).

Locally queries ChainH’s StarshipONFT for stats (Attack, Defense, Health).
Calculates net resources: (UserA Attack - UserB Defense) - (UserB Attack - UserA Defense).
Calls ChainH’s StarForgeOApp to update Health in StarshipONFT (e.g., reduce UserB Health by 1 if net > 0).
Checks win condition (Health = 0).

---

ChainH’s OApp tracks:

roundStatus: {playerId: bool} (move completed).
roundNumber: Tracks current round (max 10 for demo).
playerHealth: {playerId: number} (starts at 5 and only decreases upto 0, player loses at 0)

Chain A/B's Oapp:
zones: {playerId: number} (everytime player mines, increase it by rand(-1,2), -1 because accidents can happen when mining. min is 0)

---

Complete Game MechanicsOverview: Players (UserA, UserB) compete to reduce each other’s Health (max 5) to 0 by moving to ChainA or ChainB to claim zones (5 per chain, zones += rand(-1,2), min 0). Zones on ChainA determine Attack; zones on ChainB determine Defense. All game state is stored in ChainH’s StarForgeOApp. Players perform one simultaneous action per turn (move and claim zones), updating local zones on ChainA/B and sending updates to ChainH via send() with Composer messages (no lzRead during actions). 

The StarForgeOApp on ChainH (Base testnet) serves as the central hub for all game logic and state, managing player actions, turn progression, and outcome resolution. It receives cross-chain messages from ChainA/B OApps, updates game state, and uses lzRead to finalize turns when both players’ actions are complete, determining Health updates and win conditions.

lzRead to fetch zone counts from ChainA (Attack OApp) and ChainB (Defense OApp), sums zones to determine Attack/Defense, calculates net resources, and updates Health. The game ends when one player’s Health reaches 0, with an ERC-20 reward.

