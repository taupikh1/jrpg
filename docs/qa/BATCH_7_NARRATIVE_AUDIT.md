# Batch 7 Narrative Audit

## Baseline (pre-doc)
- `npm test`: 121 pass (Batches 1–6)
- `node tools/validate-project.mjs`: OK
- DialogueEngine / QuestLog present; schemas designed to match

## Delivered
- Full docs/narrative/* canon set
- content/narrative/canon-registry.json
- tools/narrative-validator.mjs
- tests/unit/narrative/NarrativeValidator.test.js

## Gaps (documented, not blocked)
- Literary polish of every chapter summary is outline-level, not full script
- 200–300 side quests not authored (architecture only)
- Monster stat DB deferred to Batch 11
- Choice persistence depth limited by engine (flagged in continuity rules)
EOF

# Update package.json test script
cd /home/workdir/artifacts/jrpg-new && node -e "
const fs=require('fs');
const p=JSON.parse(fs.readFileSync('package.json','utf8'));
p.version='0.7.0';
p.scripts.test='node --test tests/unit/*.test.js tests/unit/rendering/*.test.js tests/unit/world/*.test.js tests/unit/entities/*.test.js tests/unit/gameplay/*.test.js tests/unit/persistence/*.test.js tests/unit/assets/*.test.js tests/unit/narrative/*.test.js';
p.scripts['check:narrative']='node tools/narrative-validator.mjs';
fs.writeFileSync('package.json', JSON.stringify(p,null,2)+'\n');
"

# Append narrative link to docs INDEX if present
python3 - << 'PY'
from pathlib import Path
p=Path('docs/INDEX.md')
if p.exists():
    t=p.read_text()
    if 'narrative' not in t.lower():
        p.write_text(t.rstrip()+'\n\n## Narrative (Batch 7)\n\n- [Narrative README](./narrative/README.md)\n- [Story Bible](./narrative/STORY_BIBLE.md)\n')
        print('INDEX updated')
    else:
        print('INDEX already mentions narrative')
else:
    print('no INDEX')
PY
npm test 2>&1 | tail -25
node tools/narrative-validator.mjs
node tools/validate-project.mjs 2>&1 | head -3
