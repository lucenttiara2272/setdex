# SetDex

A free Pokémon TCG collection tracker. Track every set and subset card by card, see your completion and master set progress, and see what your sets and collection are worth.

**Open the app:** https://lucenttiara2272.github.io/setdex/

## What it does
- Every physical Pokémon TCG set, grouped by series, with set symbols and codes (PAF, SVI, LTR …).
- Subsets get their own tab: Radiant Collection, Trainer Gallery, Galarian Gallery, Shiny Vault, Classic Collection, the 30th Celebration Pikachu Collection.
- Tap **+** / **−** on a card to add or remove a copy. Tap the picture for reverse holos and other versions.
- Set value, master set value and the value of your own cards, from daily Cardmarket prices.
- Prices in EUR, NOK, SEK, DKK, USD or GBP, converted with the European Central Bank's daily rates.
- Sync with a private GitHub repository, so your collection is the same on every device.

## Sync your collection (free, private)
Your collection is saved in your own **private** GitHub repository, `setdex-data`, so it's the same on your phone and computer, and GitHub keeps every old version. The app talks to GitHub directly. No other server is involved.

It takes about 5 minutes, once.

### Step 1: Make a private repository for your cards
1. Open https://github.com/new
2. **Repository name:** `setdex-data`
3. Choose **Private**.
4. Tick **Add a README file**.
5. Press **Create repository**.

### Step 2: Make a token
A token is a key that only opens that one repository.

1. Open https://github.com/settings/personal-access-tokens/new
2. **Token name:** `SetDex`
3. **Expiration:** pick **1 year**. When it runs out, just make a new one.
4. **Repository access:** pick **Only select repositories**, then **Select repositories** → `setdex-data`.
5. **Permissions:**
   1. Click **+ Add permissions**.
   2. Search for **Contents** and tick it.
   3. Contents is added as **Read-only**. Click it and change it to **Read and write**.
   4. GitHub adds **Metadata: Read-only** by itself. That's fine. Don't add anything else.
6. Press **Generate token** and **copy it right away**. GitHub only shows it once. It starts with `github_pat_`.

When it's right, the Permissions box shows exactly this:

| Permission | Access |
|---|---|
| Contents | Read and write |
| Metadata | Read-only |

### Step 3: Connect the app
1. Open SetDex → **Settings → Sync with GitHub**.
2. **Data repository:** `lucenttiara2272/setdex-data`
3. Paste the token and press **Connect**.

Do step 3 once on every phone and computer. The token is stored only in that browser. It isn't part of backups or the synced file.

### If it doesn't work
| The app says | What to do |
|---|---|
| *"didn't accept the token"* | The token was copied wrong or has expired. Make a new one. |
| *"couldn't find the repository"* | Check the repository name, and that `setdex-data` is selected under Repository access. |
| *"isn't allowed to change"* | Contents is still Read-only. Edit the token on GitHub and set Contents to Read and write. |

**Lost a device or think the token leaked?** Delete it at https://github.com/settings/personal-access-tokens. It can only reach `setdex-data`, so nothing else is exposed.

**Need an older version of your collection?** Open `collection.json` in `setdex-data` → **History**, download the version you want, then use **Settings → Restore from backup** in the app.

## Where the data comes from
- Cards, pictures and prices: [TCGdex](https://tcgdex.dev). Missing pictures fall back to the [Pokémon TCG API](https://pokemontcg.io).
- Exchange rates: European Central Bank, via [Frankfurter](https://frankfurter.dev).

Prices are estimates of the market value, not what a shop will pay.
