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
Your collection is saved in your own **private** repository, `setdex-data`. The app talks to GitHub directly. No other server is involved.

1. Open https://github.com/settings/personal-access-tokens/new
2. Name it `SetDex` and pick an expiry date.
3. **Repository access:** Only select repositories → `setdex-data`.
4. **Repository permissions:** Contents → **Read and write**. Leave everything else as it is.
5. Generate the token and copy it.
6. In SetDex, go to **Settings → Sync with GitHub**. Enter `lucenttiara2272/setdex-data`, paste the token and press **Connect**.

Do the last step once on each device. The token is stored only in that browser. It isn't part of backups or the synced file.

**Lost a device or think the token leaked?** Delete the token at https://github.com/settings/personal-access-tokens. Nothing else is exposed, because the token can only touch `setdex-data`.

## Where the data comes from
- Cards, pictures and prices: [TCGdex](https://tcgdex.dev). Missing pictures fall back to the [Pokémon TCG API](https://pokemontcg.io).
- Exchange rates: European Central Bank, via [Frankfurter](https://frankfurter.dev).

Prices are estimates of the market value, not what a shop will pay.
