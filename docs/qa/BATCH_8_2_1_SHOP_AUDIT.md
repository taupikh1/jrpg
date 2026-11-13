# Shop Audit
- Implementation: dialogue choice `effects.shopBuy` + GameplayDemoScene `dialogue.choice_selected` handler.
- Prices: herb 5, rusty_sword 12.
- Insufficient gold: toast, no inventory change.
- Bug fixed: shopBuy was on terminal **node** (never applied by DialogueEngine); moved to **choice** effects.
