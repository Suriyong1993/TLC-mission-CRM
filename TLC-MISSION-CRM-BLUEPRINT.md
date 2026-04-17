# 🌊 TLC-mission CRM — Master Blueprint

> ระบบติดตามพันธกิจคริสตจักรแบบครบวงจร สำหรับทีมพันธกิจกาฬสินธุ์
> **Tagline:** "ซับซ้อนข้างใน เรียบง่ายข้างนอก" — ระบบนี้ช่วยทีมพันธกิจ ลดเวลาจาก 3 ชั่วโมง เหลือ 3 นาที 🙏

---

## 📋 Document Metadata

| | |
|---|---|
| **Version** | 1.0.0 |
| **Status** | Master Blueprint — Ready for implementation |
| **Target Runtime** | Claude Code / Antigravity |
| **Tech Stack** | Next.js 15 + TypeScript + Tailwind CSS + Supabase |
| **Design Vibe** | Deep Ocean Glass |
| **Language** | Thai-first UI, English code/identifiers |

---

## 🔒 ARCHITECTURAL DECISIONS (LOCKED)

ก่อนอ่านส่วนอื่น เข้าใจ 4 decisions นี้ให้ชัด — ทุก component, schema, และ query ต้องเคารพข้อจำกัดเหล่านี้:

### Decision 1: Groups are Fully Dynamic
- **No enums** for group codes in schema (no `G01 | G02 | ...` types)
- `care_groups` is a regular CRUD table — seed data only lives in `seed.sql`
- Every UI that lists groups MUST query DB — never hardcode
- Group lifecycle supports: create, rename, reassign leader, change body, archive
- **Never delete** — use `archived_at` timestamp for soft deletion

### Decision 2: Body = Current Tenant, Schema-Ready for Multi-level
- Current tenancy: `body_id` is the isolation boundary (RLS: `body_id = current_tenant()`)
- Schema is pre-wired for future: every tenant-owned table has nullable `organization_id` column
- **Access pattern:** all queries go through a `current_tenant()` RPC function — never hardcode `.eq('body_id', ...)` at call sites
- Migration path: body → (body + org) → (body + org + region) — no breaking changes needed

### Decision 3: Weekly Data = Immutable Snapshots
- All weekly records include: `week_number`, `iso_year`, `snapshot_at`, `superseded_by` (nullable self-FK)
- **No UPDATE on weekly records.** Edit = INSERT new row + set old row's `superseded_by`
- Latest query pattern: `SELECT DISTINCT ON (week_number, iso_year, entity_id) ... ORDER BY snapshot_at DESC`
- Applies to: 8-pillar weekly metrics, per-group มาคจ. counts, any aggregate "this week" figure
- **Benefit:** free audit trail, rollback capability, historical leaderboards stay stable

### Decision 4: Three Separated Domains — Never Merge

| Domain | When Recorded | Table | Granularity | Mental Model |
|---|---|---|---|---|
| **Attendance** | After each meeting | `attendance_records` | Per meeting × per member | "Was X at meeting Y?" |
| **Attitude** | Periodic assessment (monthly/quarterly) | `attitude_assessments` | Per member × effective_date | "What is X's current spiritual posture?" |
| **Visit** | Any pastoral contact (separate from meetings) | `visit_records` | Per visit event | "Did we reach X this week?" |

**Rules:**
- **No shared UI:** attendance check-in ≠ attitude form ≠ visit log
- **No shared form:** never put attitude dropdowns inside attendance form
- **No shared table:** three separate tables, joined by `member_id` only
- **Profile page** must show 3 separate timelines (don't interleave)
- **Alerts logic** can combine signals across domains (e.g., `attitude='น้อย' AND last_visit > 30 days`) — but the domains themselves stay pure

---

## 🌊 PART 1: PRODUCT FOUNDATION

### 1.1 Vision

TLC-mission CRM คือระบบติดตามพันธกิจคริสตจักรที่ออกแบบมาสำหรับทีมงานในพื้นที่ชนบทจังหวัดกาฬสินธุ์ โดยมีจุดประสงค์หลักคือช่วยให้:

1. **ผู้รับผิดชอบกลุ่ม** บันทึกข้อมูลรายสัปดาห์ได้ภายใน 3 นาที
2. **ผู้นำระดับ Body** เห็นภาพรวม 8 เสาหลักแบบ real-time
3. **ทีมอภิบาล** รู้ทันทีว่าสมาชิกคนไหนต้องดูแลด่วน
4. **ผู้บริหารคริสตจักร** ได้รายงานที่ส่ง LINE/PDF ได้ทันที

### 1.2 Target Users

| Persona | อายุ | Device | Tech Level | Context |
|---|---|---|---|---|
| **หัวหน้าแคร์กรุ๊ป (หนค.)** | 25-55 | Android mid-range | LINE + FB daily | กรอกข้อมูลตอนกลางคืนหลังประชุม |
| **หัวหน้า Body (หนบ.)** | 35-60 | iPad + Android | moderate | ดูภาพรวม Body ของตนเองรายสัปดาห์ |
| **ผู้บริหารทีม G** | 40-65 | Desktop + mobile | varied | ดู dashboard 8 เสา ส่งรายงาน |
| **สมาชิกเป้าหมาย (Admin)** | 30-50 | Desktop | high | จัดการข้อมูลสมาชิก / ตั้งค่าระบบ |

### 1.3 Core Business Model

#### 1.3.1 องค์กรโครงสร้าง (6 Body Network)

```
คริสตจักรชีวิตสุขสันต์กาฬสินธุ์
  └── Team G (ทีมพันธกิจ)
        ├── Body 1: เมือง 1
        ├── Body 2: เมือง 2
        ├── Body 3: สมเด็จ
        ├── Body 4: ท่าคันโท
        ├── Body 5: กุฉินารายณ์
        └── Body 6: คำใหญ่
              └── Care Groups (G01-G20, dynamic count)
                    └── Members (165+ คน)
```

#### 1.3.2 ระบบผู้นำ (Leadership Pipeline)

```
หนบ. (หัวหน้า Body)
  ↑ (promote)
หนค. (หัวหน้าแคร์กรุ๊ป)
  ↑
พล.1 (พี่เลี้ยงระดับ 1)
  ↑
พล.2 (พี่เลี้ยงระดับ 2)
  ↑
สมาชิกกำลังสร้าง
```

**Pipeline states:** เริ่มสร้าง → กำลังพัฒนา → ใกล้พร้อม → พร้อมแต่งตั้ง

#### 1.3.3 8 เสาหลัก (Core KPI Framework)

ข้อมูลรายสัปดาห์ที่ต้องบันทึก:

| # | เสา | ประเภท | ตัวอย่างเป้า |
|---|---|---|---|
| 1 | การประกาศ | count | 60 คน/สัปดาห์ |
| 2 | การติดตามผล | count | 800 คน/สัปดาห์ |
| 3 | การอภิบาล | count | 82 คน/สัปดาห์ |
| 4 | การสร้างผู้นำ | count (cumulative) | 94 คน |
| 5 | อธิษฐานเช้าพุธ | attendance | 25 คน |
| 6 | การเข้า พพช. | attendance | 60 คน |
| 7 | การมาคริสตจักร (มาคจ.) | attendance | 200 คน |
| 8 | การมาแคร์กรุ๊ป | attendance | 200 คน |

> **Note:** เสา 5, 6, 7, 8 มี detail breakdown เพิ่มเติม (online/offline, per-group, per-course)

### 1.4 Key User Journeys

#### Journey A — หนค. กรอกข้อมูลประจำสัปดาห์ (most frequent)
```
1. เปิดแอปหลังประชุมกลุ่ม (เวลา 21:00)
2. Dashboard → แตะ "กรอก มาคจ. ประจำสัปดาห์"
3. เลือกกลุ่มของตนเอง (auto-pre-selected)
4. กรอกจำนวนผู้เข้าร่วม → ขนาดกลุ่ม auto-calculate (BIG/STD/MINI)
5. แตะ "เช็คชื่อสมาชิก" → ติ๊กคนที่มา
6. แตะ "บันทึก" → ✅ Done in 3 minutes
```

#### Journey B — หนบ. ดูภาพรวม Body
```
1. เปิดแอป → Dashboard
2. เห็น 8 เสาหลัก + Health Score ของ Body ทันที
3. แตะ "ศูนย์การดูแล" → เห็นสมาชิกที่ต้องเยี่ยมด่วน
4. แตะ "🙏" ข้างชื่อ → AI generates คำอธิษฐานและแผนเยี่ยม
5. Share plan ผ่าน LINE
```

#### Journey C — ผู้บริหารทีม G ส่งรายงานรายสัปดาห์
```
1. เปิด Dashboard วันจันทร์เช้า
2. แจ้งเตือน "📋 รายงานสัปดาห์ที่ 22 พร้อมแล้ว"
3. Preview → แก้ไขเล็กน้อย
4. แตะ "ส่ง LINE" → ส่งเข้ากลุ่มผู้นำทันที
```

### 1.5 Out of Scope (Phase 1)

❌ ไม่ใช่:
- ระบบการเงิน (ถวาย/จ่าย) — แยกเป็นอีกระบบ
- ระบบส่งข้อความกลุ่มใหญ่ (ใช้ LINE OA ต่างหาก)
- e-commerce / booking / ticketing
- Video conferencing

---

## 🎨 PART 2: DESIGN SYSTEM — Deep Ocean Glass

### 2.1 Design Philosophy

**Feels like:** สมุดบันทึกอัจฉริยะที่รู้จักทีมของคุณ — อบอุ่น มั่นใจ ทันสมัย
**Not like:** ฐานข้อมูลราชการ ฟอร์มบริษัท เกมยิง

**Core tension:** spiritual warmth × modern confidence
**Visual language:** deep ocean at night — ข้อมูลเยอะแต่สงบ, เหมือนมองท้องฟ้ายามค่ำ

### 2.2 Color Tokens (Semantic, Not Literal)

ใช้ CSS custom properties ใน `globals.css`:

```css
:root {
  /* Ink layers — structural darkness */
  --ink-deep:    #050d1a;  /* deepest bg, like night sky */
  --ink-mid:     #0a1628;  /* card background */
  --ink-lift:    #0f2444;  /* hovered/raised surface */
  --ink-input:   #0d1e36;  /* form fields background */

  /* Lines — borders */
  --line:        #1e3a5f;  /* default borders */
  --line-bright: #2d5a8e;  /* active/focused borders */

  /* Text — hierarchy */
  --text-main:   #e8f4ff;  /* primary text (11:1 contrast) */
  --text-soft:   #7db4d8;  /* labels, metadata */
  --text-ghost:  #3d6a8a;  /* placeholders, hints */

  /* Semantic accents — color by MEANING */
  --sky:         #3b82f6;  /* primary action, links */
  --water:       #06b6d4;  /* growth metric, cyan accent */
  --gold:        #f59e0b;  /* harvest, weekly target */
  --growth:      #10b981;  /* new believers, success */
  --alert:       #f43f5e;  /* urgent care, danger */
  --spirit:      #8b5cf6;  /* AI, admin, insights */

  /* 8-Pillar accent colors (for pillar-specific UI) */
  --pillar-1:    #f97316;  /* การประกาศ - orange */
  --pillar-2:    #3b82f6;  /* การติดตามผล - blue */
  --pillar-3:    #10b981;  /* การอภิบาล - green */
  --pillar-4:    #8b5cf6;  /* สร้างผู้นำ - purple */
  --pillar-5:    #ec4899;  /* อธิษฐานพุธ - pink */
  --pillar-6:    #06b6d4;  /* พพช. - teal */
  --pillar-7:    #f59e0b;  /* มาคจ. - amber */
  --pillar-8:    #ef4444;  /* มาแคร์ - red */

  /* Group size classification (from TLC-mission) */
  --size-big:    var(--growth);   /* ≥12 people */
  --size-std:    var(--water);    /* 7-11 people */
  --size-mini:   var(--spirit);   /* ≤6 people */

  /* Body colors (for body badges) */
  --body-1:      #3b82f6;  /* เมือง 1 */
  --body-2:      #06b6d4;  /* เมือง 2 */
  --body-3:      #8b5cf6;  /* สมเด็จ */
  --body-4:      #10b981;  /* ท่าคันโท */
  --body-5:      #f59e0b;  /* กุฉินารายณ์ */
  --body-6:      #ec4899;  /* คำใหญ่ */
}
```

**Contrast requirements:**
- `--text-main` on `--ink-mid` = **11:1** ✓ (exceeds WCAG AAA)
- `--text-soft` on `--ink-mid` = **4.5:1** ✓ (WCAG AA)
- All accent colors used with white text: verified ≥ 4.5:1

### 2.3 Typography — Thai-first Stack

```css
/* Import from Google Fonts in app/layout.tsx */
--font-display:  'Kanit', system-ui, sans-serif;          /* weights: 800, 900 */
--font-body:     'Sarabun', system-ui, sans-serif;        /* weights: 400, 500, 600 */
--font-mono:     'JetBrains Mono', 'Menlo', monospace;    /* weights: 400, 600 */
```

**Usage rules:**

| Context | Font | Weight | Use case |
|---|---|---|---|
| Display numerics | Kanit | 900 | Big KPI numbers, hero stats |
| Page titles | Kanit | 800 | Dashboard headers, section titles |
| UI labels | Sarabun | 500/600 | Button text, card titles |
| Body text | Sarabun | 400 | Paragraphs, descriptions |
| Data/codes | JetBrains Mono | 400/600 | Group codes, dates, week numbers |

**Scale (Tailwind-compatible):**

```
xs:     11px  / tracking-wider uppercase  → badges, meta labels
sm:     13px  → secondary info, metadata
base:   14px  → body text, form labels (DEFAULT)
lg:     16px  → card titles
xl:     20px  → section headers
2xl:    28px  → page titles (with Kanit 800)
hero:   48px  → big KPI numbers (with Kanit 900)
```

### 2.4 Spacing (4px Base Grid)

Use only these multiples: `2, 4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64, 80`

**Tailwind mapping:** `p-2` (8px), `p-3` (12px), `p-4` (16px), `p-5` (20px), `p-6` (24px), `p-8` (32px)

### 2.5 Radius

```css
--radius-sm:    6px;      /* badges, chips, small buttons */
--radius-md:    10px;     /* inputs, small cards */
--radius-lg:    14px;     /* main cards (DEFAULT for cards) */
--radius-xl:    18px;     /* modals, panels */
--radius-2xl:   24px;     /* chat bubbles, hero sections */
--radius-full:  9999px;   /* pills, avatars */
```

### 2.6 Elevation — Glass Layer System

```css
/* Layer 0: transparent (page bg) */
.glass-0 { background: transparent; }

/* Layer 1: standard card */
.glass-1 {
  background: rgba(10, 22, 40, 0.75);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--line);
}

/* Layer 2: raised (hover, focus, active panels) */
.glass-2 {
  background: rgba(15, 36, 68, 0.85);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--line-bright);
}

/* Layer 3: modal (highest) */
.glass-3 {
  background: rgba(5, 13, 26, 0.95);
  backdrop-filter: blur(32px);
  -webkit-backdrop-filter: blur(32px);
  border: 1px solid var(--line-bright);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
}
```

**Rule:** ห้ามใช้ flat white background หรือ hard shadows ทุกอย่างต้องมี blur + translucent

### 2.7 Motion Rules

```css
/* Duration tokens */
--motion-fast:    100ms;  /* hover color change, focus ring */
--motion-normal:  200ms;  /* button press, toggle, badge */
--motion-slow:    300ms;  /* panel slide, modal open, page transition */
--motion-count:   800ms;  /* number count-up on mount */

/* Easing */
--ease-entry:     cubic-bezier(0.16, 1, 0.3, 1);   /* for entries */
--ease-exit:      cubic-bezier(0.4, 0, 1, 1);      /* for exits */
--ease-bounce:    cubic-bezier(0.68, -0.55, 0.265, 1.55);  /* spring feel */
```

**NEVER animate:**
- Layout shifts (height, width changes that cause reflow)
- Text wrap changes
- Font size (causes jank)

**ALWAYS use `prefers-reduced-motion`:**
```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

### 2.8 Component Language — Universal Rules

#### Cards
- Always `glass-1` minimum
- `rounded-lg` (14px)
- `overflow-hidden` (for top gradient accent line)
- Entrance: fade-up with stagger delay (50ms per card)
- Hover: `scale(1.01)` + shadow deepens
- **Top Accent Line (every important card):** 2px gradient strip
  - Blue→Cyan for data cards
  - Gold→Orange for target/goal cards
  - Rose→Orange for alert cards
  - Purple→Pink for AI cards

#### Buttons

```
Primary:    gradient sky→water, white text, rounded-lg
            hover: brightness(1.1) + glow-sky shadow
            active: scale(0.97)
            loading: spinner replaces icon, text dims

Secondary:  glass bg, --line border, --text-soft text
            hover: bg-ink-lift, text-main

Ghost:      transparent, subtle border on hover only

Danger:     gradient alert→orange, USE ONLY for destructive actions

AI/Spirit:  gradient spirit→sky, for AI-powered actions only
```

**Size rules:**
- Mobile CTA: `min-height: 48px` (thumb-friendly)
- Desktop: `min-height: 38px`
- Icon-only: `36×36px` square, `rounded-md`
- FAB: `52px` circle (mobile) / `56px` (desktop)

#### Inputs

```
Background:   var(--ink-input)
Border:       1px solid var(--line)
Focus:        border var(--sky) + glow ring rgba(59,130,246,0.25)
Font:         Sarabun 14px, color var(--text-main)
Placeholder:  var(--text-ghost)
Label:        above input, 11px uppercase tracking-wider var(--text-soft)
Error:        border var(--alert) + red text below
Height:       44px (single-line, touch-friendly)
```

**Special — "Light Input Mode" (from TLC-mission):** When admin does heavy data entry (เช่น กรอก มาคจ. ทั้ง 20 กลุ่ม), form section uses light inputs for reduced eye strain:

```css
.input-heavy-entry {
  background: #f8f7ff;   /* soft white */
  color: #1a1a2e;        /* dark text */
  min-height: 52px;
  font-size: 20px;
  border: 1px solid var(--line);
}
.input-heavy-entry:focus {
  border-color: var(--sky);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
}
```

Apply only to: `/entry/weekly-makj`, `/reports/create` step inputs, bulk edit modals.

#### Badges

| Badge Type | Dot | Bg | Text | Border | Special |
|---|---|---|---|---|---|
| Attitude ดี | green | `growth/10` | `growth` | `growth/30` | — |
| Attitude ปานกลาง | gold | `gold/10` | `gold` | `gold/30` | — |
| Attitude น้อย | rose | `alert/10` | `alert` | `alert/30` | **pulse animation on dot** |
| Size BIG | — | `growth/15` | `growth` | `growth/40` | glow shadow |
| Size STD | — | `water/15` | `water` | `water/40` | glow shadow |
| Size MINI | — | `spirit/15` | `spirit` | `spirit/40` | glow shadow |
| Week/Date | — | glass | `text-soft` | `line` | mono font |

#### Avatars

- Circle with letter initial (ใช้อักษรไทยตัวแรกของชื่อ)
- Background gradient based on attitude:
  - ดี: `emerald → teal`
  - ปานกลาง: `blue → indigo`
  - น้อย: `rose → orange`
  - unknown: `gray → slate`
- Sizes: `sm=28px`, `md=40px`, `lg=56px`
- **Group overlap:** each shifts right 8px, white ring border (2px)

#### Empty States

- Centered, min-height 200px
- Large emoji (48px) with gentle float animation
- Thai message in **encouraging tone** (not "No data found")
- CTA button below if action needed
- Example:
  ```
  👥
  ยังไม่มีสมาชิก
  เพิ่มสมาชิกคนแรกของกลุ่มได้เลยครับ
  [+ เพิ่มสมาชิก]
  ```

#### Loading States

- Skeleton shimmer (NOT spinner for layouts)
- Match skeleton shape to actual content (not generic bars)
- Show after 200ms delay (avoid flash for fast loads)

```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.skeleton {
  background: linear-gradient(90deg,
    var(--ink-mid) 25%,
    var(--ink-lift) 50%,
    var(--ink-mid) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

### 2.9 Icon System

- Library: **Lucide React** (free, consistent, tree-shakeable)
- Size defaults: `sm=16px`, `md=20px`, `lg=24px`
- Stroke width: `1.5` (matches Sarabun weight)
- Color: inherit from parent (`currentColor`)

### 2.10 Accessibility Baseline

- **Touch targets:** min 44×44px for all interactive elements
- **Focus rings:** visible on all focusable elements (never `outline: none` without replacement)
- **Color info:** never rely on color alone (always add icon/text/label)
- **Screen readers:** `aria-label` on all icon-only buttons
- **Loading:** `aria-busy="true"` during fetch
- **Errors:** `role="alert"` for screen readers
- **Reduced motion:** respect `prefers-reduced-motion`
- **Contrast:** all text meets WCAG AA minimum (4.5:1), primary text meets AAA (7:1+)

---

## 🗺️ PART 3: INFORMATION ARCHITECTURE

### 3.1 Sitemap

```
TLC-mission CRM
│
├── /login
│
├── / (Dashboard)                    ← landing after login
│
├── /entry (Data Entry Hub)
│   ├── /entry/weekly-pillars        ← 8 เสาหลัก รายสัปดาห์ (ทีม G level)
│   ├── /entry/weekly-makj           ← มาคจ. 20 กลุ่ม (TLC-mission quick entry)
│   └── /entry/attendance/[groupId]  ← เช็คชื่อสมาชิกรายกลุ่ม
│
├── /groups
│   ├── /groups                      ← list (grid of care groups)
│   ├── /groups/[id]                 ← group detail
│   ├── /groups/[id]/report/new      ← 5-step report wizard
│   ├── /groups/[id]/edit
│   └── /groups/new
│
├── /members
│   ├── /members                     ← list (table + card view toggle)
│   ├── /members/[id]                ← profile (3 separated timelines)
│   ├── /members/[id]/edit
│   └── /members/new
│
├── /leaderboard                     ← 20 groups ranked by มาคจ.
│
├── /leaders (Leadership Pipeline)
│   ├── /leaders                     ← 4 role tabs (หนบ./หนค./พล.1/พล.2)
│   └── /leaders/pipeline             Kanban: กำลังสร้าง
│
├── /trends                          ← 12-week line charts per pillar
│
├── /prayer-school
│   ├── /prayer-school/prayer        ← อธิษฐานเช้าพุธ
│   └── /prayer-school/courses       ← พพช. courses
│
├── /care (Care Intelligence)
│   ├── /care                        ← alerts feed
│   └── /care/visit-plan             ← printable visit list
│
├── /reports
│   ├── /reports                     ← list of past reports
│   ├── /reports/[id]                ← detail (LINE-ready layout)
│   └── /reports/weekly-summary      ← auto-generated weekly PDF
│
├── /ai-assistant                    ← full-screen AI chat (also available as FAB widget)
│
└── /settings
    ├── /settings/profile
    ├── /settings/body               ← Body-level settings
    ├── /settings/notifications
    └── /settings/integrations       ← LINE Notify, email, etc.
```

### 3.2 Navigation Model

#### Desktop (≥1024px)
- **Sidebar:** fixed left, 256px wide, collapsible to 64px icons-only
- **Top bar:** sticky, contains page title + health score ring + live badge + refresh
- **AI FAB:** bottom-right floating (always accessible)

#### Tablet (768-1023px)
- Sidebar collapses to icons-only by default
- Tap to expand as overlay

#### Mobile (<768px)
- **Bottom tabs:** 5 slots
  - หน้าหลัก (Home) — `/`
  - กรอกข้อมูล (Entry) — `/entry`
  - สมาชิก (Members) — `/members`
  - แจ้งเตือน (Care) — `/care` (with badge count)
  - เพิ่มเติม (More) — opens bottom sheet
- **AI FAB:** above bottom tabs (bottom: 76px)
- **Sidebar items in "More" sheet:** Leaderboard, Leaders, Trends, Prayer/School, Reports, Settings

### 3.3 Page Role Matrix

| Page | Role needed | RLS scope | Can edit? |
|---|---|---|---|
| Dashboard | all | own body | view-only |
| /entry/weekly-pillars | หนบ. + admin | own body | yes |
| /entry/weekly-makj | หนค. + above | own groups | yes |
| /entry/attendance/[id] | หนค. (of that group) + above | that group | yes |
| /groups | all | own body | list only |
| /groups/[id] edit | หนค. (own) + หนบ. + admin | own body | yes |
| /members/[id] | all (own body) | own body | depends on role |
| /leaderboard | all | own body | view-only |
| /leaders | หนบ. + admin | own body | yes |
| /care | all | own body | view + action only |
| /reports | all | own body | own reports editable |
| /settings/body | หนบ. + admin | own body | yes |

### 3.4 URL Conventions

- Plural resources: `/groups`, `/members`, `/reports`
- Dynamic IDs use UUIDs (Supabase default): `/groups/550e8400-e29b-...`
- Actions as path segments: `/groups/[id]/report/new` (not `?action=new`)
- Filters as query params: `/members?attitude=low&body=3`
- Dates in ISO: `/reports?week=22&year=2026`

---

## 📄 PART 4: PAGE-BY-PAGE SPEC

Each page spec follows the format:
- **UX Goal** (1-line intent)
- **Route + Access**
- **Layout** (mobile-first description)
- **Components** (key interactive elements)
- **Data flow** (what queries run, what mutations)
- **Empty state** + **Error state**

### 4.1 /login

**UX Goal:** "ระบบนี้ดูดี น่าเชื่อถือ ใช้ง่าย" — first impression matters

**Access:** public

**Layout (mobile-first):**

```
┌─────────────────────────────┐
│   [mesh gradient bg, dot    │
│    grid texture, very low   │
│    opacity, NO animation]   │
│                             │
│   ┌─ glass-2 card ────────┐ │  max-w-[440px]
│   │                       │ │  centered
│   │   ⛪ (glowing circle)  │ │
│   │                       │ │
│   │ ระบบติดตามกลุ่มพันธกิจ  │ │  Kanit 800, 22px
│   │ คริสตจักรกาฬสินธุ์      │ │  Sarabun 400, 13px
│   │                       │ │
│   │ ┌─Body─┬─Admin──┐     │ │  tab switcher
│   │                       │ │
│   │ [group select ▼]      │ │  (Body tab only)
│   │ [🔒 password   👁]     │ │
│   │                       │ │
│   │ [ เข้าสู่ระบบ ──────►]  │ │  full-width, 48px
│   │                       │ │
│   │ 💡 demo passwords...  │ │  collapsible hint
│   └───────────────────────┘ │
└─────────────────────────────┘
```

**Components:**

1. **Logo circle:** 64px, gradient `sky → water` border, box-shadow `0 0 0 4px rgba(59,130,246,0.15)` + sky glow
2. **Tab switcher (Body | Admin):**
   - 2 pills, full width, glass bg
   - Active: sky gradient bg, white text, slight glow
   - Inactive: transparent, `text-soft`
   - Transition: 150ms
3. **Group dropdown (Body tab):** custom dropdown (NOT native `<select>`) — shows colored body-dot + body-name
4. **Password input:**
   - Lock icon left (text-ghost)
   - Eye toggle right (show/hide)
   - Focus: border glows sky
5. **Submit button:**
   - Body tab: `sky→water` gradient
   - Admin tab: `spirit→sky` gradient
   - Loading: spinner + "กำลังเข้าสู่ระบบ..."
   - Error: shake animation (0.3s, translateX)

**Error state:** "รหัสผ่านไม่ถูกต้อง — ลองใหม่อีกครั้ง" (rose text, fade in from top, NOT aggressive red box)

**Data flow:**
- POST to Supabase auth: `signInWithPassword({ email: bodyId + '@mission.local', password })`
- On success → redirect to `/` + client-side session
- On failure → show error + shake

### 4.2 / (Dashboard)

**UX Goal:** "เปิดมา 5 วินาที รู้ทันทีว่าสัปดาห์นี้เป็นยังไง"

**Access:** authenticated

**Layout:**

```
┌─ STICKY HEADER (glass-1) ────────────────┐
│ สวัสดีครับ 🙏                              │
│ [Body Name] (Kanit 800, 22px)            │
│ [วันที่] — สัปดาห์ที่ [X] (mono)   [HR] • [refresh] │
└──────────────────────────────────────────┘

┌─ HERO STATS (horizontal scroll mobile) ─┐
│ [🏠 กลุ่ม]  [👥 สมาชิก] [🤝 ประชุม] [⚠️ ท่าทีน้อย]│
│  20 ↑2%    165 ↑5%     18 →         3 ↓1%      │
└──────────────────────────────────────────┘

┌─ 8 PILLAR CARDS GRID (2×4 mobile, 4×2 desktop) ─┐
│ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐│
│ │เสา 1 ประกาศ│ │เสา 2 ติดตาม│ │เสา 3 อภิบาล│ │เสา 4 ผู้นำ  ││
│ │ 53/60      │ │ 682/800    │ │ 82/82 ✓   │ │ 51/94      ││
│ │ ▲ +12      │ │ ▲ +68      │ │ → 0       │ │ ▲ +5       ││
│ │ ▓▓▓▓░ 88%  │ │ ▓▓▓▓▓ 85%  │ │ ▓▓▓▓▓100% │ │ ▓▓░░░ 54%  ││
│ │ ∿∿∿∿∿     │ │ ∿∿∿∿∿     │ │ ∿∿∿∿∿    │ │ ∿∿∿∿∿     ││
│ └───────────┘ └───────────┘ └───────────┘ └───────────┘│
│ (same pattern for pillars 5-8: อธิษฐาน, พพช., มาคจ., มาแคร์) │
└──────────────────────────────────────────┘

┌─ QUARTERLY PROGRESS (full width glass card) ──┐
│ เป้าหมาย Q1            [Q1|Q2|Q3|Q4] selector │
│ กลุ่ม    ████████░░  16/20  80% (growth)      │
│ สมาชิก   ██████████ 165/150 110% (growth)     │
│ ประกาศ   ██████░░░░  459/720 64% (gold)       │
│ ผู้นำใหม่ ██░░░░░░░░   8/30 27% (alert)       │
└──────────────────────────────────────────────┘

┌─ MIDDLE ROW (5/12 | 3/12 | 4/12 on desktop) ─┐
│ [🏠 กลุ่มทั้งหมด] [📊 ท่าที donut] [⚡ ต้องใส่ใจ]│
│  list rows          SVG pie         alert feed │
└──────────────────────────────────────────────┘

┌─ CHARTS ROW (2 col desktop, stacked mobile) ─┐
│ [📈 เยี่ยม vs เป้า] [👥 ผู้เข้าร่วม 8 ครั้ง]  │
│  area chart          composed bar+line       │
└──────────────────────────────────────────────┘

┌─ QUICK ACTIONS (horizontal strip, glass) ────┐
│ [+ บันทึกรายงาน] [+ เช็คชื่อ] [📊 รายงาน] [🤖 ถาม AI]│
└──────────────────────────────────────────────┘
```

**Pillar Card — detailed spec:**

```
┌─ glass-1 card, rounded-lg, top-accent-line ─┐
│ [orange accent bar 2px top]                  │
│ เสาที่ 1           📢                         │  (11px uppercase label + emoji 20px)
│ การประกาศ                                     │  (16px Sarabun 600)
│                                              │
│ 53                    ▲ +12                  │  (Kanit 900, 48px + growth badge)
│ /60 (ghost)                                  │
│                                              │
│ เป้า 60 · 88%                                │  (Sarabun 12px text-soft)
│ ▓▓▓▓▓▓▓▓▓░ (progress bar 6px)                │  (orange fill)
│                                              │
│ ∿∿∿∿∿∿∿∿ (8-point sparkline, orange)        │  (30px height)
│                                              │
│ [background: faded emoji 📢 at 0.04 opacity] │
└──────────────────────────────────────────────┘
```

**Components:**

1. **StatCrystal cards (hero row):**
   - `glass-1`, top-accent-line, `rounded-lg`
   - Main number: Kanit 900, 48px, `text-shadow: 0 0 20px currentColor`
   - Count-up animation on mount (800ms, ease-out cubic)
   - Trend badge: ↑+X% (growth/water), ↓-X% (alert), → 0 (ghost)
   - Label: 10px uppercase tracking-wider text-ghost
   - Background icon: emoji at 64px, opacity 0.04, bottom-right -8px
   - Entrance: stagger 80ms per card

2. **8 Pillar Cards:** (see detailed spec above)
   - Click → navigate to `/trends?pillar=[n]`
   - Hover: lift + glow matching pillar color
   - Sparkline: Recharts `<Line>` with `dot={false}` and pillar color

3. **Quarterly Progress Strip:** 4 mini bars, color by progress %

4. **Middle row:**
   - **Group Radar (5/12):** list of groups with code + name + member count + mini attendance bar
   - **Attitude Donut (3/12):** custom SVG 120px, 3 arcs (growth/gold/alert) with gap between
   - **Alert Feed (4/12):** max 5 alerts with colored left border by severity

5. **Charts row:** Recharts AreaChart + ComposedChart with dark theme
   - Grid: `--line` stroke, dashed
   - Axis: `--text-ghost`, 10px, no line
   - Custom tooltip: glass card, Thai labels

6. **Quick Actions:** 4 glass pills in a row, each `44px height`

**Data flow (Server Component in Next.js App Router):**

```ts
// app/page.tsx (Server Component)
export default async function Dashboard() {
  const supabase = createServerClient();
  const tenant = await getCurrentTenant();

  // Parallel queries
  const [pillars, stats, alerts, groups, attitude, trends] = await Promise.all([
    fetchLatestPillarSnapshots(supabase, tenant),  // uses DISTINCT ON (week, pillar)
    fetchHeroStats(supabase, tenant),
    fetchActiveAlerts(supabase, tenant, { limit: 5 }),
    fetchGroupsWithAttendance(supabase, tenant),
    fetchAttitudeDistribution(supabase, tenant),
    fetchTrendData(supabase, tenant, { weeks: 12 }),
  ]);

  return <DashboardView {...{ pillars, stats, alerts, groups, attitude, trends }} />;
}
```

**Empty state:** First-time user, no data yet
```
👋
ยินดีต้อนรับสู่ TLC-mission CRM
เริ่มต้นด้วยการเพิ่มกลุ่มแคร์กรุ๊ปแรกของคุณ
[+ เพิ่มกลุ่มแรก]
```

### 4.3 /entry/weekly-pillars

**UX Goal:** "กรอก 8 ตัวเลข เสร็จใน 60 วินาที"

**Access:** หนบ. + admin

**Layout:**

```
┌─ HEADER ────────────────────────────────────┐
│ กรอกข้อมูลประจำสัปดาห์                         │
│ ทีม G · สัปดาห์ที่ 22 · มี.ค. 2026            │
│ [ประวัติ →] (small top-right)                │
└─────────────────────────────────────────────┘

┌─ WEEK SELECTOR ─────────────────────────────┐
│ เลือกสัปดาห์                                  │
│ [📅 22 มีนาคม 2026]                          │
│ [สป.นี้•] [สป.ที่แล้ว] [2 สป.] [3 สป.]        │
└─────────────────────────────────────────────┘

┌─ PROGRESS INDICATOR (sticky) ───────────────┐
│ ▓▓▓▓▓▓░░ 6/8 เสาบันทึกแล้ว                   │
└─────────────────────────────────────────────┘

┌─ PILLAR FORM GRID (1 col mobile, 2 col desktop) ─┐
│ ┌─────────────────────────────┐              │
│ │ 🟠 การประกาศ                 │              │  (Light Input Mode)
│ │ [    53    ] (large white input) │          │
│ │ เป้า: 60 · สป.ก่อน: 41        │              │
│ │ ▓▓▓▓▓▓▓░ 88%                 │              │
│ └─────────────────────────────┘              │
│ ┌─────────────────────────────┐              │
│ │ 🔵 การติดตามผล               │              │
│ │ [   682    ]                │              │
│ │ เป้า: 800 · สป.ก่อน: 614      │              │
│ │ ▓▓▓▓▓▓▓▓░ 85%               │              │
│ └─────────────────────────────┘              │
│ ... (6 more pillar cards)                   │
└─────────────────────────────────────────────┘

┌─ STICKY BOTTOM BAR (glass-2) ───────────────┐
│ [    💾 บันทึกข้อมูล    ]                     │
│ ล้างฟอร์ม (ghost text link)                  │
└─────────────────────────────────────────────┘
```

**Important — Light Input Mode applies here** (admin heavy entry):
- Input bg: `#f8f7ff`
- Input text: `#1a1a2e`
- Input height: 52px
- Font: Sarabun 22px, text-align center
- Focus: sky border + glow

**Form behavior:**
- Each input: `type="number"`, `inputMode="numeric"`
- As user types → progress bar fills immediately (controlled input)
- Progress bar color: >80% growth, 50-79% gold, <50% alert
- Each field auto-saves draft to localStorage every 2s
- Validation: numbers ≥ 0 only, no decimals

**Data flow:**

```ts
// app/entry/weekly-pillars/actions.ts
'use server';

export async function saveWeeklyPillars(data: WeeklyPillarsInput) {
  const supabase = createServerClient();
  const tenant = await getCurrentTenant();
  const weekInfo = getCurrentWeek(data.date);

  // IMMUTABLE SNAPSHOT PATTERN
  // 1. Mark any existing record for this week as superseded
  const { data: existing } = await supabase
    .from('pillar_snapshots')
    .select('id')
    .eq('body_id', tenant.bodyId)
    .eq('week_number', weekInfo.week)
    .eq('iso_year', weekInfo.year)
    .is('superseded_by', null);

  // 2. Insert new snapshot
  const { data: newSnapshot } = await supabase
    .from('pillar_snapshots')
    .insert({
      body_id: tenant.bodyId,
      week_number: weekInfo.week,
      iso_year: weekInfo.year,
      pillar_1: data.pillar1,
      pillar_2: data.pillar2,
      // ... pillar_3 through pillar_8
      recorded_by: tenant.userId,
      snapshot_at: new Date().toISOString(),
    })
    .select()
    .single();

  // 3. Link old to new
  if (existing && existing.length > 0) {
    await supabase
      .from('pillar_snapshots')
      .update({ superseded_by: newSnapshot.id })
      .in('id', existing.map(e => e.id));
  }

  revalidatePath('/');
  return { success: true };
}
```

**Success state:** Toast at top — "บันทึกสำเร็จ! ✓" growth color, 3s auto-dismiss

### 4.4 /entry/weekly-makj

**UX Goal:** "กรอกทั้ง 20 กลุ่มในรวดเดียว ไม่ต้องคลิกหลายขั้น"

**Access:** หนค. + หนบ. + admin

**Layout:**

```
┌─ HEADER ────────────────────────────────────┐
│ กรอก มาคจ. ประจำสัปดาห์                        │
│ [สัปดาห์ 20] [สัปดาห์ 21] [สัปดาห์ 22•] [สัปดาห์ 23] │
│ สัปดาห์ที่ 22 | 15-21 มี.ค. 2569              │
└─────────────────────────────────────────────┘

┌─ PROGRESS ──────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓░ 18/20 กลุ่มบันทึกแล้ว             │
└─────────────────────────────────────────────┘

┌─ QUICK ENTRY TABLE (all groups visible) ────┐
│ ┌─────────────────────────────────────────┐ │
│ │[G01] ผุสดี      [ 15 ] [BIG] ✨         │ │  (64px row, glass-1)
│ │[G02] เบญ        [  8 ] [STD]            │ │
│ │[G03] ปุนนาภา    [ 12 ] [BIG]            │ │
│ │[G04] ทัศนา      [  6 ] [MINI]           │ │
│ │[G05] ดาวใจ      [ __ ] [—]              │ │
│ │... (all groups dynamically loaded)       │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘

┌─ STICKY BOTTOM (glass-2) ───────────────────┐
│ รวม มาคจ. ทั้งหมด: 150 คน                    │
│ [    บันทึกทั้งหมด    ]                       │
└─────────────────────────────────────────────┘
```

**Row spec (each group):**

```
┌─────────────────────────────────────────────┐
│ [G01]  ผุสดี           [ 15 ]  [BIG] ✨     │
│  ↑      ↑               ↑       ↑          │
│  neon   Sarabun 18px    white   auto-calc  │
│  pill   bold            input   size badge │
│  (body                  52px h  updates   │
│   color)                22px    on type    │
│                         center            │
└─────────────────────────────────────────────┘
```

**Live size calculation (on input change):**
```ts
function getSize(count: number): 'BIG' | 'STD' | 'MINI' | '—' {
  if (count >= 12) return 'BIG';    // --growth
  if (count >= 7) return 'STD';     // --water
  if (count >= 1) return 'MINI';    // --spirit
  return '—';                        // empty, gray
}
```

**Size badge transition:** smooth color morph (200ms) as number crosses threshold

**Important:**
- **Groups are dynamic** — fetch from `care_groups` table where `body_id = tenant.bodyId AND archived_at IS NULL`
- Order by `sort_order` column (admins can reorder)
- If new group added → appears automatically
- If group archived → hidden from this list (but historical data preserved)

**Save button success animation:**
- Shimmer effect while loading
- Burst + green flash on success
- Success toast: "บันทึก มาคจ. ทั้งหมดสำเร็จ! ✓"

**Data flow:** Same immutable snapshot pattern as weekly-pillars, but per-group:
```ts
// Insert into `group_makj_snapshots` table
// One row per (group × week), old rows marked superseded_by
```

### 4.5 /entry/attendance/[groupId]

**UX Goal:** "เช็คชื่อทุกคนในกลุ่มหนึ่งได้ใน 2 นาที"
