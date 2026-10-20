# SetDex

A free Pokémon TCG collection tracker. Track every set and subset card by card, see your completion and master set progress, and see what your sets and collection are worth.

**Open the app:** https://lucenttiara2272.github.io/setdex/

## What it does
- Every physical Pokémon TCG set, grouped by series, with set symbols and codes (PAF, SVI, LTR …).
- Subsets get their own tab: Radiant Collection, Trainer Gallery, Galarian Gallery, Shiny Vault, Classic Collection, the 30th Celebration Pikachu Collection.
- Tap **+** / **−** on a card to add or remove a copy. Tap the picture for reverse holos and other versions.
- Set value, master set value and the value of your own cards, from daily Cardmarket prices.
- Prices in EUR, NOK, SEK, DKK, USD or GBP, converted with the European Central Bank's daily rates.
- **Trading:** mark cards **for trade**, keep a **wants** list, and share your binder with friends as a link. Their app shows what you can swap, and what it's worth.
- Sync with a private GitHub repository, so your collection is the same on every device. Connect your phone by scanning a QR code.

## Install it as an app (works offline)
**iPhone:** open the app link in **Safari** → tap **Share** → **Add to Home Screen** → **Add**.
**Android:** open the app link in **Chrome** → tap **⋮** → **Install app** (or **Add to Home screen**). Settings in the app also has an **Install SetDex** button when your phone supports it.

Once installed, SetDex has its own icon, opens full screen, and **works without internet**:
- Changes you make offline are saved on the phone and sync when you're back online. Card by card, the newest change wins.
- Pictures of cards you've seen before are kept, so your sets still look complete.
- Prices and new sets need internet. The app shows the last prices it saved.

## Trading with friends
1. Open a card you own and use the **For trade** counter, or press **Trade → Put my duplicates up for trade** (you keep one of each).
2. Add cards you're looking for to your **wants**: open a card and press **♡ Add to wants**, or open a set and press **♡ Want missing**. Cards leave the list by themselves when you add them to your collection.
3. Go to **Trade**, write your name and press **Share my binder**. Send the link to a friend.
4. Your friend opens the link and sees **what they can get from you** and **what they can give you**, with values. They can press **Save friend** and send you their own link back.

The link holds your lists itself, so no account or server is needed. Friends don't need GitHub. When your lists change, share a new link.

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

**Phone the easy way:** on a computer that's already connected, go to **Settings → Sync with GitHub → Connect another device (QR code)** and scan the code with your phone's camera. The phone connects by itself, with no typing. The code contains your token, so don't screenshot or share it. It disappears after 2 minutes.

Otherwise, do step 3 once on every phone and computer. The token is stored only in that browser. It isn't part of backups or the synced file.

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

## Card data copy
The set list, card lists, set logos and symbols are copied into [`data/`](data/) every Monday by the **Update card data** GitHub Action ([`scripts/build-data.mjs`](scripts/build-data.mjs)). The app loads them from this site first, so it's faster and works offline. Sets newer than the copy are still fetched from TCGdex. Card pictures and prices aren't copied; they're loaded live. To update right away, go to **Actions → Update card data → Run workflow**.

## Legal
SetDex is a free, unofficial, fan-made tool. It isn't produced, endorsed, sponsored, supported or approved by Nintendo, The Pokémon Company, Creatures Inc. or GAME FREAK, and it isn't affiliated with them in any way.

Pokémon, the Pokémon Trading Card Game, all Pokémon and character names, set names, set logos and symbols, card names, card text and card artwork are trademarks and/or copyrights of their owners (© Nintendo, Creatures Inc., GAME FREAK inc., The Pokémon Company). They're shown only to identify cards and sets, and no ownership of them is claimed.

Card data comes from [TCGdex](https://github.com/tcgdex/cards-database) and is used under the MIT license (see [`data/LICENSE-TCGdex.txt`](data/LICENSE-TCGdex.txt)).

**Rights holders:** if you'd like any material removed, please [open an issue](https://github.com/lucenttiara2272/setdex/issues) and it will be taken down promptly.
