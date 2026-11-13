# Content Reconciliation

## Counting rules
- **Definition** = one dialogue export object with unique `id`
- **Node** = one key in `nodes`
- **Spoken line** = non-empty `node.text`
- **Choice label** = non-empty `choice.text` (counted separately from spoken lines)
- Empty nodes/labels = 0 in current source

## Current source (authoritative)
| Bucket | Definitions | Nodes | Spoken lines | Choice labels |
|--------|-------------|-------|--------------|---------------|
| Main + support | 24 | 152 | 152 | 11 |
| Party banter | 5 | 22 | 22 | 0 |
| **Total** | **29** | **174** | **174** | **11** |

## Historical discrepancy
- Batch 8.3 “174 nodes / 184 lines” ≈ total nodes 174 + choice labels (~10–11) as “written lines”
- Batch 8.3.1 “152 main nodes / 162+ lines” counted **main only** nodes + some choice labels
- **No content loss** — difference is metric scope (main vs total), not deleted scenes
- Classification: **STRUCTURAL / REPORTING DIFFERENCE**, not CONTENT LOSS

## All 29 IDs present
See main.ids + party.ids in source audit script output.
