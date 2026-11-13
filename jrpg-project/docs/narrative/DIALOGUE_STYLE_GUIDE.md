# Dialogue Style Guide

## Voice Capsules
- **Orin:** short, sincere questions; rarely speeches
- **Mira:** map metaphors, teasing warmth
- **Kael:** clipped; one honest paragraph when walls fall
- **Tavi:** rapid, inventive slang
- **Sera:** precise nouns; moral lines cut clean
- **Iven:** understatement
- **Neris:** rhythmic, sparse imagery
- **Bram:** slow; one proverb max per scene

## Categories
Main, optional, ambient, quest accept/progress/complete, battle barks, conditional, hidden.

## Rules
- No mutual exposition of shared knowledge without tension.
- Mobile-readable line length.
- Choices: cosmetic / info / relationship / quest outcome / major (rare).
- Compatible with DialogueEngine nodes + choices + effects (e.g. acceptQuest).

## Sample — chapter_01 (Ashwillow elder)
```
elder_intro:
  speaker: Elder Henn
  text: The sky was kinder when I knew its names. Today I reached for the founding hymn and… found a blank.
  choices:
    - text: We’ll help look for the words.
      next: elder_hope
    - text: Maybe it’s only age.
      next: elder_age
```

## Sample — Mira join (chapter_02)
```
mira_meet:
  speaker: Mira Solenne
  text: If your village is losing names, my charts are lying too. That’s not weather. That’s a broken legend trying to rewrite the path.
```
