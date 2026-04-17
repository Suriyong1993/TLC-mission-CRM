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
│   └── /leaders/pipeline            ← kanban: กำลังสร้าง
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

**Access:** หนค. ของกลุ่มนั้น + หนบ. + admin

**Layout:**

```
┌─ HEADER ────────────────────────────────────┐
│ ← เช็คชื่อ                          [87%]    │
│ G01 ผุสดี | เมือง 1                  │ring │
│ 22 มี.ค. 2569                               │
└─────────────────────────────────────────────┘

┌─ MEMBER LIST (glass cards, 72px each) ──────┐
│ ┌─────────────────────────────────────────┐ │
│ │ (👤) ทัศนา (ทัศ, 28)                    │ │
│ │       [มา✓] [ลา] [ขาด]                  │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ (👤) สมศรี (ศรี, 32)                    │ │
│ │       [มา] [ลา✓] [ขาด]                  │ │
│ └─────────────────────────────────────────┘ │
│ ...                                         │
└─────────────────────────────────────────────┘

┌─ GUEST SECTION ─────────────────────────────┐
│ + เพิ่มผู้มาใหม่ที่ยังไม่อยู่ในรายชื่อ          │
│ [name input] [Enter to add]                 │
│ Chips: [สมหมาย ใหม่ ×] [บุญศรี ใหม่ ×]        │
└─────────────────────────────────────────────┘

┌─ SUMMARY STRIP ─────────────────────────────┐
│ ✓ มา 13  ·  ↩ ลา 2  ·  ✗ ขาด 1              │
└─────────────────────────────────────────────┘

┌─ STICKY BOTTOM ─────────────────────────────┐
│ [    บันทึกเช็คชื่อ     ]                    │
└─────────────────────────────────────────────┘
```

**Status pill behavior:**
- 3 pills per row (52px each)
- Only 1 active at a time (mutually exclusive)
- มา → fills growth color on tap
- ลา → fills gold color on tap
- ขาด → fills alert color on tap
- Tap feedback: scale(0.95) 100ms

**Guest chips:** ghost bg + "ใหม่" gold badge + × remove

**Attendance ring (top-right):** Circular SVG progress, fills as people marked "มา"
- Color: alert (0-50%) → gold (50-80%) → growth (80%+)
- Center: "%" Kanit 800

**CRITICAL RULE — Decision 4:**
- This page ONLY records attendance (มา/ลา/ขาด)
- DO NOT add attitude selectors here
- DO NOT add "ท่าที" buttons in this form
- Attitude is assessed separately on member profile page

**Data flow:**
```ts
// Create one meeting record + N attendance records
const meeting = await insertMeeting({ group_id, date, body_id });
const attendance = members.map(m => ({
  meeting_id: meeting.id,
  member_id: m.id,
  status: m.selectedStatus,  // 'present' | 'leave' | 'absent'
  body_id: tenant.bodyId,
}));
await supabase.from('attendance_records').insert(attendance);

// Guests create temporary member records (is_guest: true)
for (const guest of guests) {
  const newMember = await createGuestMember({ name: guest.name, group_id, body_id });
  await supabase.from('attendance_records').insert({
    meeting_id: meeting.id,
    member_id: newMember.id,
    status: 'present',
    body_id: tenant.bodyId,
  });
}
```

### 4.6 /groups (List)

**UX Goal:** "เห็นทุกกลุ่มใน Body ของฉัน กรองตามพื้นที่ได้"

**Access:** all (own body)

**Layout:**

```
┌─ HEADER ────────────────────────────────────┐
│ แคร์กรุ๊ป                                     │
│ 20 กลุ่ม · 165 สมาชิก                [🔍]   │
└─────────────────────────────────────────────┘

┌─ FILTER BAR (horizontal scroll) ────────────┐
│ [ทั้งหมด•] [เมือง1] [เมือง2] [สมเด็จ] [ท่าคันโท]│
└─────────────────────────────────────────────┘

┌─ SEARCH ────────────────────────────────────┐
│ [🔍 ค้นหาชื่อกลุ่ม, ผู้นำ...]                 │
└─────────────────────────────────────────────┘

┌─ GROUP CARDS (1 col mobile, 2-3 col desktop) ┐
│ ┌───────────────────────────────────────┐   │
│ │ (left accent: body color)              │   │
│ │ [G01] ผุสดี แซ่ก่วย                    │   │
│ │ [เมือง 1] [แคร์กรุ๊ป]                   │   │
│ │ 📅 จันทร์ 19:30  📍 บ้านในเมือง         │   │
│ │ 👤 ผุสดี  👥 ประสาน: สมชาย 089-xxx      │   │
│ │ 🏠 8 สมาชิก  [🗺 ดูแผนที่]              │   │
│ │ [📸][📸][📸] (photo thumbnails)        │   │
│ │                            [แก้ไข]     │   │
│ └───────────────────────────────────────┘   │
│ ... (more cards)                            │
└─────────────────────────────────────────────┘

FAB: bottom-right [+] gradient spirit→sky
```

**Important — dynamic groups:**
- Query: `SELECT * FROM care_groups WHERE body_id = $1 AND archived_at IS NULL ORDER BY sort_order`
- Never hardcode group list
- If no groups yet → empty state with CTA "เพิ่มกลุ่มแรก"

### 4.7 /groups/[id]/report/new (5-Step Wizard)

**UX Goal:** "กรอกรายงานประชุมได้ใน 3 นาที ไม่ต้องคิดว่าต้องกรอกอะไร"

**Access:** หนค. (of that group) + หนบ. + admin

**Layout (sticky progress indicator at top):**

```
┌─ PROGRESS BAR (sticky) ─────────────────────┐
│ ① ─── ② ─── ③ ─── ④ ─── ⑤                  │
│ เลือก เช็คชื่อ พระคำ กิจกรรม รูปภาพ              │
└─────────────────────────────────────────────┘
```

**Step 1 — เลือกกลุ่มและวันที่:**
- Group cards grid (NOT dropdown): 2 col mobile, 3 col desktop
- Each card 80px: code + name + day + assignee
- Selected: sky border + glow + top-line
- Date picker: native styled to match design
- Week number: auto-calculated, editable
- Reporter name: text input

**Step 2 — เช็คชื่อสมาชิก:**
- Member grid (2 col mobile, 3 col desktop)
- Each card 72px
- UNCHECKED: avatar + name + attitude badge + `--line` border
- CHECKED (tap): growth/10 fill + growth border + ✓ appears (bounce animation)
- Live counter ring top-right
- Guest section at bottom (same as 4.5)

**Step 3 — พระคำและบทเรียน:**
- **AI Lesson Button (prominent):**
  - Glass card with spirit gradient left border
  - "💡 ให้ AI แนะนำบทเรียนสัปดาห์นี้"
  - Opens bottom sheet with 3 lesson cards
  - Selecting one auto-fills fields
- **Bible verse input:** "เช่น ยอห์น 14:6" placeholder
- **Verse text:** textarea 5 rows
  - When filled: blockquote style (gold left border 3px, italic, gold/5 bg)
- **Key points (dynamic list):**
  - Numbered circles + text input + × remove
  - "+ เพิ่มประเด็น" ghost button
  - "🤖 เติมจาก AI" small chip

**Step 4 — กิจกรรมและผลลัพธ์:**
- **Activities checkboxes** — horizontal chips grid (NOT vertical list!)
  - Pre-filled: แบ่งปันพระคำ | แบ่งปันพระพร | อธิษฐาน | นมัสการ | กิจกรรมกลุ่ม | อื่นๆ
  - Checked: sky bg + white + ✓
  - Unchecked: glass bg + ghost
- **Takeaways (dynamic list):** same pattern as key points
- **Special notes:** textarea "เรื่องพิเศษ หรือ หมายเหตุ (ถ้ามี)"
- **AI Summary button:** "🤖 ให้ AI ช่วยสรุปรายงานทั้งหมด" → generates preview with "ใช้สรุปนี้ | แก้ไขเอง"

**Step 5 — รูปภาพ:**
- 4 upload zones:
  - Zone 1 (large top): "📷 รูปกลุ่ม" — drag or tap
  - Zones 2-4 (2 col grid): Slides | กิจกรรม | โปรไฟล์
- Each: dashed border when empty, thumbnail + caption when filled
- Compress notification: "🗜️ บีบอัดรูปเพื่อประหยัดพื้นที่"
- Skip option: "ข้ามขั้นตอนนี้ →"

**Bottom navigation (sticky, all steps):**
```
[← ย้อนกลับ]                    [บันทึกรายงาน →]
          💾 บันทึกร่างอัตโนมัติ
```

**Auto-save:** Every 5s to localStorage (key: `draft-report-${groupId}-${date}`)

### 4.8 /reports/[id] (LINE-Ready Layout)

**UX Goal:** "อ่านง่ายเหมือน newsletter ส่ง LINE ได้ทันที"

**Layout:** Single column, max-w-640px, centered

```
┌─ DOCUMENT HEADER ───────────────────────────┐
│ 📋 รายงานพันธกิจประจำสัปดาห์                   │  (11px uppercase)
│ [Group Name]                                 │  (Kanit 800, 24px)
│ 22 มี.ค. 2026 · สัปดาห์ที่ 22                 │  (mono, ghost)
│                                              │
│              [LINE] [PDF] [🔗] [🖨]          │  (action row, right)
└─────────────────────────────────────────────┘

┌─ PHOTO GALLERY (if photos) ─────────────────┐
│ [main photo full width, rounded-xl]         │
│ [📸] [📸] [📸] (3-col grid below)            │
└─────────────────────────────────────────────┘

┌─ ATTENDEE SECTION ──────────────────────────┐
│ 🏠 [Group Name]                              │
│ ผู้เข้าร่วม (15 คน):                          │
│                                              │
│ (👤) (👤) (👤) (👤) (👤) (👤) (👤) +8         │
│  Name Name Name Name Name Name Name          │
│                                              │
│ (attitude gradient avatars for members)      │
│ (ghost bg + "ใหม่" badge for guests)         │
└─────────────────────────────────────────────┘

┌─ BIBLE VERSE ───────────────────────────────┐
│ 📖 การแบ่งปันพระคำ                             │  (with sky gradient bottom border)
│                                              │
│ ยอห์น 14:6  (sky, Kanit 600, 16px)           │
│                                              │
│ ❝                                            │  (large gold quotes)
│   "เราเป็นทางนั้น เป็นความจริง..."            │  (blockquote, gold border-left 3px)
│                                              │  (italic Sarabun 15px, line-height 1.8)
│                                            ❞ │  (gold/5 bg, rounded-r-xl)
└─────────────────────────────────────────────┘

┌─ KEY POINTS ────────────────────────────────┐
│ 🔑 ประเด็นสำคัญ                                │
│ (1) พระเยซูทรงเป็นทางเดียว...                 │
│ (2) ความเชื่อนำสู่ความจริง...                 │
│ (3) ชีวิตใหม่ในพระคริสต์...                   │
│                                              │
│ (numbered circles, sky bg, Kanit 700)        │
└─────────────────────────────────────────────┘

┌─ ACTIVITIES ────────────────────────────────┐
│ 🙏 กิจกรรมที่ทำ                                │
│ [✅ แบ่งปันพระคำ] [✅ อธิษฐาน] [✅ นมัสการ]     │
│                                              │
│ (growth tint chips with checkmark)           │
└─────────────────────────────────────────────┘

┌─ TAKEAWAYS ─────────────────────────────────┐
│ 🎯 สิ่งที่ได้รับ / นำไปใช้                     │
│ → ตอบสนองการทรงเรียกในชีวิตประจำวัน           │
│ → แบ่งปันพระคำกับเพื่อนร่วมงาน                 │
│                                              │
│ (sky → arrows, growth/5 bg, left border)     │
└─────────────────────────────────────────────┘

┌─ SPECIAL NOTES ─────────────────────────────┐
│ 📝 เรื่องพิเศษ                                │
│ สมาชิก 2 คนตอบรับเชื่อในวันนี้                │
│                                              │
│ (amber/5 bg, amber left border, if content)  │
│ "ไม่มีระบุเพิ่มเติม" (ghost text, if empty)   │
└─────────────────────────────────────────────┘

┌─ FIXED SHARE BAR (bottom, glass-2, 64px) ───┐
│ [📤 ส่ง LINE] [📄 PDF] [🔗] [🖨]             │
│  (LINE #06c755)  (sky)  (glass) (glass)      │
│  LINE button slightly larger                 │
└─────────────────────────────────────────────┘
```

**LINE integration:**
- "ส่ง LINE" button opens LINE share sheet with:
  - Pre-filled message: report summary (text)
  - Link: public preview URL (read-only)
  - Image: rendered report screenshot (if chosen)

**PDF export:** Server-side render using Puppeteer or `@react-pdf/renderer`

### 4.9 /members (List + Profile)

**UX Goal (List):** "หาสมาชิกที่ต้องการได้ในไม่กี่วินาที"

**List page layout:**

```
┌─ FILTER BAR (glass, sticky top) ────────────┐
│ [🔍 ค้นหาชื่อ อาชีพ ที่อยู่...]               │
│ [ทุกกลุ่ม ▼] [ท่าทีทั้งหมด ▼] [ความถี่ ▼]     │
│ [☰ ตาราง] [⊞ การ์ด]                         │
│                                              │
│ ● ดี 89  ·  ● ปานกลาง 52  ·  ● น้อย 24      │
└─────────────────────────────────────────────┘

TABLE VIEW (default desktop):
┌────┬──────────────┬──────────┬───────────┬──────────┬────────┐
│ ┃  │ Person       │ Attitude │ Frequency │ Last Visit│ Actions│
├────┼──────────────┼──────────┼───────────┼──────────┼────────┤
│ ┃  │ (👤) ทัศนา    │ ● ดี     │ ●●●●      │ 3 วัน    │ ✏️ 👤 📝│
│    │ G04 ทัศนา    │          │ ทุกสป.    │          │ (hover)│
├────┼──────────────┼──────────┼───────────┼──────────┼────────┤
│ ┃  │ (👤) สมชาย    │ ● น้อย✨  │ ●●○○      │ 45 วัน ⚠│        │
│ ↑  │ G03 ปุนนาภา   │          │ 1-2/เดือน │          │        │
│ attitude color                                                │
└────┴──────────────┴──────────┴───────────┴──────────┴────────┘

CARD VIEW (alternate, 2-3 col grid):
┌─────────────────┐
│ (👤)             │  avatar center-top, 48px
│                 │
│ ทัศนา ชื่นจิต    │  Kanit 700
│ [G04 ทัศนา]     │  group chip
│ ████████░░      │  attitude bar (mini horizontal)
│                 │
│ ประชุม 12 · เยี่ยม 3  วันล่าสุด 3 วัน  │
│                 │
│ [✏️][👤][📝]    │  action row
└─────────────────┘
```

**Row features:**
- Left attitude accent bar (3px, full height)
- Col 1 PERSON: avatar + name + group ghost text below
- Col 2 ATTITUDE: badge pill (dot + text), ท่าทีน้อย has pulse animation
- Col 3 FREQUENCY: 4 dots filled per frequency level + label below
- Col 4 LAST VISIT:
  - >30 days: "45 วัน" rose badge + warning icon
  - <7 days: "3 วัน" growth badge
  - Never: "ยังไม่เยี่ยม" alert text
- Col 5 ACTIONS (hidden, appear on row hover):
  - [✏️ แก้ไข] [👤 โปรไฟล์] [📝 กิจกรรม]
  - Glass pill row, fade in 100ms

### 4.10 /members/[id] (Profile)

**UX Goal:** "เห็นประวัติทั้งหมดของคนนี้ในที่เดียว — แยก 3 มิติชัดเจน"

**CRITICAL — Decision 4:** 3 timelines MUST be separate sections, NEVER interleaved.

**Layout:**

```
┌─ PROFILE HEADER ────────────────────────────┐
│ ← (back)                                     │
│                                              │
│       (👤 large avatar 96px)                 │
│       ทัศนา ชื่นจิต                          │
│       28 ปี · ทัศ · [G04 ทัศนา] [ดี]          │
│                                              │
│       [✏️ แก้ไข] [📝 บันทึกกิจกรรม]          │
└─────────────────────────────────────────────┘

┌─ 4 MINI STATS (top strip) ──────────────────┐
│ [ครั้งประชุม] [ครั้งเยี่ยม] [ปีรับเชื่อ] [อายุ]│
│  12            3             2020         28 │
│ (Kanit 800 28px + 10px label)                │
└─────────────────────────────────────────────┘

┌─ TWO COLUMNS (stack on mobile) ─────────────┐
│                                              │
│ ┌─ PERSONAL INFO (glass-1) ──┐               │
│ │ ชื่อ-สกุล: ทัศนา ชื่นจิต     │               │
│ │ ชื่อเล่น: ทัศ               │               │
│ │ อายุ: 28                    │               │
│ │ อาชีพ: นักพัฒนาซอฟต์แวร์    │               │
│ │ สถานที่: บริษัท Anthropic   │               │
│ │ ครอบครัว: โสด                │               │
│ │ วันรับเชื่อ: 15 พ.ค. 2563   │               │
│ │ ผู้รับผิดชอบ: ผุสดี          │               │
│ │ เป้าหมาย: เป็นผู้นำกลุ่ม Q4   │               │
│ └────────────────────────────┘               │
│                                              │
│ ┌─ STATS + PROGRESS (glass-1) ─┐             │
│ │ การเข้าประชุม: 12/15 (80%)    │             │
│ │ ▓▓▓▓▓▓▓▓░░                   │             │
│ │                              │             │
│ │ การเยี่ยมเยียน: 3 ครั้ง       │             │
│ │ ล่าสุด: 3 วันที่แล้ว          │             │
│ │                              │             │
│ │ บทเรียน: กำลังศึกษาข้อ 3/5    │             │
│ └──────────────────────────────┘             │
└─────────────────────────────────────────────┘

┌─ 📅 ATTENDANCE TIMELINE ────────────────────┐
│ (separate section — attendance only)         │
│                                              │
│ ●──●──●──○──●──●──●──●──●──●──●──○            │
│ สป22 สป21 สป20 สป19 ...                     │
│ Filled = attended, empty = absent            │
│ Each: date label + week + meeting topic      │
│                                              │
│ Hover: tooltip with meeting details          │
│ Click: navigate to /meetings/[id]            │
└─────────────────────────────────────────────┘

┌─ 💙 ATTITUDE HISTORY ───────────────────────┐
│ (separate section — attitude assessments)    │
│                                              │
│ [ปัจจุบัน: ดี]                               │
│                                              │
│ Q1 2026 ─── ดี                               │  (green dot)
│ Q4 2025 ─── ปานกลาง                          │  (gold dot)
│ Q3 2025 ─── ปานกลาง                          │  (gold dot)
│ Q2 2025 ─── น้อย                             │  (alert dot + pulse)
│                                              │
│ Each: effective date + assessed_by +          │
│       optional notes                          │
│                                              │
│ [+ ประเมินท่าทีใหม่]                         │
└─────────────────────────────────────────────┘

┌─ 🏠 VISIT TIMELINE ─────────────────────────┐
│ (separate section — visit records only)      │
│                                              │
│ ●  12 มี.ค. · พบตัว (growth)                 │
│    โดย: ผุสดี · หัวข้อ: เยี่ยมหลังประชุม      │
│                                              │
│ ●  5 มี.ค. · ไม่อยู่ (ghost)                 │
│    โดย: ผุสดี · นัดใหม่ 12 มี.ค.              │
│                                              │
│ ●  20 ก.พ. · นัดใหม่ (sky)                   │
│    โดย: สมชาย · หัวข้อ: คุยเรื่องครอบครัว    │
│                                              │
│ [+ บันทึกการเยี่ยม]                          │
└─────────────────────────────────────────────┘
```

**Important:** Three timelines MUST be visually distinct sections with their own headers. DO NOT merge into one timeline.

### 4.11 /leaderboard

**UX Goal:** "เห็นอันดับทุกกลุ่มชัดเจน สนุก มีชีวิตชีวา"

**Layout:**

```
┌─ HEADER ────────────────────────────────────┐
│ LEADERBOARD (Kanit 900, gradient)            │
│ DIVISION CARE · Q1 2026                      │
│ ● สด (pulsing green dot)                     │
│                                              │
│ [สป22•] [สป21] [สป20]  (week filter)        │
│ [ทั้งหมด•] [เมือง1] [เมือง2]  (body filter)  │
└─────────────────────────────────────────────┘

┌─ SUMMARY ROW (3 neon pills) ────────────────┐
│ [BIG: 1] [STD: 12] [MINI: 7]                 │
│  growth  water     spirit (with glow)        │
└─────────────────────────────────────────────┘

┌─ RANKINGS ──────────────────────────────────┐
│ ┌─ Rank 1 (gold border + shimmer) ────────┐ │
│ │ ① [G01] ผุสดี           15 คน [BIG]      │ │
│ │    ▓▓▓▓▓▓▓▓▓░                            │ │
│ │    +6 ↑  (growth pill)                   │ │
│ └─────────────────────────────────────────┘ │
│ ┌─ Rank 2 (silver glow) ──────────────────┐ │
│ │ ② [G03] ปุนนาภา         12 คน [BIG]      │ │
│ │    +3 ↑                                  │ │
│ └─────────────────────────────────────────┘ │
│ ┌─ Rank 3 (bronze glow) ──────────────────┐ │
│ │ ③ [G02] เบญ             10 คน [STD]      │ │
│ │    -2 ↓                                  │ │
│ └─────────────────────────────────────────┘ │
│ ... (Rank 4-20 as glass cards, alternating) │
└─────────────────────────────────────────────┘

┌─ FOOTER ────────────────────────────────────┐
│ รวม มาคจ. ทั้งหมด: 150 คน (gold)            │
│ BIG ≥12 · STD 7-11 · MINI ≤6                │
└─────────────────────────────────────────────┘
```

**Card features:**
- Rank number: huge faded background number (decorative, 120px Kanit 900, opacity 0.15)
- Care code: neon body-colored pill tag
- Leader name: Sarabun 18px white bold
- Attendance bar: neon gradient progress (member count vs max)
- Size badge: colored by BIG/STD/MINI
- Change chip: "+6 ↑" growth / "-2 ↓" alert / "→" ghost

**Top 3 animations:**
- Rank 1: gold gradient border + shimmer (continuous)
- Rank 2: silver glow border (static)
- Rank 3: bronze glow border (static)

**Query:**
```sql
-- Uses DISTINCT ON to get latest snapshot per group per week
SELECT DISTINCT ON (g.id, s.week_number, s.iso_year)
  g.id, g.code, g.leader_name, s.makj_count,
  s.makj_count - LAG(s.makj_count) OVER (...) as change
FROM care_groups g
JOIN group_makj_snapshots s ON s.group_id = g.id
WHERE g.body_id = $1
  AND g.archived_at IS NULL
  AND s.superseded_by IS NULL
  AND s.week_number = $2
ORDER BY g.id, s.week_number, s.iso_year, s.snapshot_at DESC
ORDER BY s.makj_count DESC;
```

### 4.12 /leaders (Leadership Pipeline)

**Layout:**

```
┌─ SUMMARY (4 cards top) ─────────────────────┐
│ [หนบ. 5/5✓]  [หนค. 17/25]                   │
│ purple 100%   teal 68%                       │
│ [พล.1 17/26] [พล.2 12/38⚠]                  │
│ blue 65%      orange 32% (needs attention)   │
└─────────────────────────────────────────────┘

┌─ TABS ──────────────────────────────────────┐
│ [หนบ.•] [หนค.] [พล.1] [พล.2] [กำลังสร้าง]    │
└─────────────────────────────────────────────┘

หนบ. TAB — Leader Cards Grid (3 per row):
┌─────────────────────────────────────────────┐
│ ┌────────┐ ┌────────┐ ┌────────┐             │
│ │(LG) เดช │ │(LG) เก่ง│ │(LG) เพลิน│          │
│ │สมเด็จ   │ │ท่าคันโท  │ │กุฉินารายณ์│          │
│ │[หนบ.]  │ │[หนบ.]  │ │[หนบ.]   │          │
│ │ดูราย→ │ │ดูราย→ │ │ดูราย→  │          │
│ └────────┘ └────────┘ └────────┘             │
│ (avatar colored by body)                     │
└─────────────────────────────────────────────┘

กำลังสร้าง TAB — Pipeline Kanban:
┌─ 4 columns ─────────────────────────────────┐
│ เริ่มสร้าง (3)| กำลังพัฒนา(5)|ใกล้พร้อม(2)|พร้อม(1)│
├──────────────┼─────────────┼──────────┼─────┤
│ [👤 นพ]     │ [👤 ส้ม]    │ [👤 อาย]  │ [👤 ปู]│
│ → หนค.       │ → หนค.      │ → หนค.   │→หนบ. │
│              │             │          │      │
│ [👤 เอก]     │ [👤 บี]     │          │      │
│ → พล.2       │ → พล.1      │          │      │
└──────────────┴─────────────┴──────────┴─────┘

FAB: [+ เพิ่มผู้นำ]
```

### 4.13 /trends

**UX Goal:** "ดูแนวโน้ม 12 สัปดาห์ของแต่ละเสาได้ง่าย"

**Layout:**

```
┌─ HEADER ────────────────────────────────────┐
│ แนวโน้มรายสัปดาห์                              │
│ 12 สัปดาห์ล่าสุด · ม.ค. – มี.ค. 2026          │
└─────────────────────────────────────────────┘

┌─ PILLAR SELECTOR (horizontal scroll) ───────┐
│ [● ประกาศ] [● ติดตาม] [● อภิบาล] ...         │
│  (active pill filled, others outlined)       │
│ Active = "การมาคริสตจักร" (amber)            │
└─────────────────────────────────────────────┘

┌─ MAIN CHART (300px height) ─────────────────┐
│                                              │
│  220 ┤                                       │
│  200 ┤ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ (goal dashed)│
│  180 ┤    ●                                  │
│  160 ┤   ╱ ●─●        ●──●──●──● ← current  │
│  140 ┤  ●       ●──●        (large dot)     │
│  120 ┤                                       │
│      4ม.ค 11ม.ค 18ม.ค...22มี.ค              │
│                                              │
│  Amber area with gradient fill               │
│  Goal line dashed red at 200                 │
│  Last point 2× larger                        │
└─────────────────────────────────────────────┘

┌─ TOOLTIP (on hover) ────────────────────────┐
│ 22 มี.ค. 2026                                │
│ 160 คน                                       │
│ ▼ 4 จากสัปดาห์ก่อน                           │
│ 80% ของเป้า                                  │
└─────────────────────────────────────────────┘

┌─ STAT SUMMARY (3 cards) ────────────────────┐
│ [ค่าสูงสุด 192]  [ค่าต่ำสุด 144]  [เฉลี่ย 160]│
│  (11 ม.ค.)      (25 ม.ค.)                   │
└─────────────────────────────────────────────┘
```

**Chart tech:** Recharts `<AreaChart>` with dark theme

### 4.14 /prayer-school

Two tabs: อธิษฐานเช้าพุธ | การเข้า พพช.

**Tab 1 - อธิษฐานเช้าพุธ:**
```
┌─ WEEK TIMELINE (12 circles) ────────────────┐
│ (17) (17) (17) (17) (17) (17) (18) (20) (20) (20) (20) (20)│
│ Circle size proportional to attendance       │
│ Current week: larger, teal border            │
└─────────────────────────────────────────────┘

┌─ STACKED BAR (last 6 weeks) ────────────────┐
│ มาที่คจ. ░░░░░░  (all empty, gray)           │
│ Online   ████████  (teal filled, 17-20)     │
│ Goal line dashed at 25                       │
└─────────────────────────────────────────────┘

┌─ INSIGHT CARD ──────────────────────────────┐
│ สัปดาห์นี้: 20 คน · ต่ำกว่าเป้า 5 คน (80%)    │
│ ↑ เพิ่มขึ้นจาก 17 ตั้งแต่ ก.พ. (growth)     │
└─────────────────────────────────────────────┘
```

**Tab 2 - พพช. Courses:**
```
┌─ COURSE LIST ───────────────────────────────┐
│ ชีวิตใหม่ สถ.-คนทำงาน  10 คน  ████░░ (teal) │
│ ชีวิตใหม่ผู้อาวุโส      30 คน  ████████     │
│ หลักข้อเชื่อ            0 คน  ░░░░░░ (muted)│
│ ใกล้ชิดพระเจ้า          0 คน                 │
│ เข้าใจการนมัสการ         0 คน                 │
│ เข้าใจการเงิน           0 คน                 │
└─────────────────────────────────────────────┘

┌─ RATIO CARD (bottom) ───────────────────────┐
│ [donut 40/160 = 25%]                        │
│ คนมาคจ. 160 คน · เรียน 40 คน · 25%          │
│ เป้า 60 คน (37.5%) — ขาด 20 คน               │
└─────────────────────────────────────────────┘
```

### 4.15 /care (Care Intelligence)

**UX Goal:** "เห็นแล้วรู้ทันทีว่าต้องดูแลใครก่อน"

**Page title:** "🙏 ศูนย์การดูแล" — not "Alerts"

```
┌─ 4 PRIORITY CARDS (top) ────────────────────┐
│ ┌─ rose pulse ──┐ ┌─ gold ────┐             │
│ │ 5 คน          │ │ 8 คน       │             │
│ │ ต้องดูแลด่วน   │ │ ไม่เยี่ยม   │             │
│ │ (🧑)(🧑)(🧑)  │ │ >30 วัน    │             │
│ └──────────────┘ └───────────┘             │
│ ┌─ spirit ─────┐ ┌─ growth ──┐             │
│ │ 3 คน          │ │ 142 คน     │             │
│ │ ยังไม่มีข้อมูล │ │ ท่าทีดี/ปกติ│             │
│ └──────────────┘ └───────────┘             │
└─────────────────────────────────────────────┘

┌─ 🔴 ต้องดูแลด่วน ───────────────────────────┐
│ ┌─────────────────────────────────────────┐ │
│ │ ┃(👤 rose glow) เพ็ง ยั่งยืน  [G05]      │ │
│ │    ท่าทีน้อย 3 สัปดาห์ [45 วัน]         │ │
│ │    📅 เยี่ยมล่าสุด: 12 ก.พ.              │ │
│ │                           [📝] [🙏]     │ │
│ └─────────────────────────────────────────┘ │
│ ... (more rose cards with subtle pulse)     │
└─────────────────────────────────────────────┘

┌─ ⚠️ เฝ้าระวัง (gold section) ────────────────┐
│ ... similar cards, gold severity             │
└─────────────────────────────────────────────┘

┌─ 💙 ยังขาดข้อมูล (sky section) ─────────────┐
│ ... cards with members who need info update  │
└─────────────────────────────────────────────┘

┌─ FLOATING (if >5 alerts) ───────────────────┐
│     [สร้างแผนเยี่ยม 12 คน] (gold)           │
└─────────────────────────────────────────────┘
```

**Alert logic (CROSS-DOMAIN from Decision 4):**
- "ต้องดูแลด่วน" = `attitude = 'น้อย' AND last_visit > 30 days`
- "เฝ้าระวัง" = `attendance_rate < 50% OR last_visit > 45 days`
- "ยังขาดข้อมูล" = `attitude IS NULL OR profile_completeness < 50%`

**Action buttons:**
- 📝 → navigate to `/members/[id]/activity/new` (pre-filled)
- 🙏 → open AI prayer writer (bottom sheet): generates a prayer for this specific person

**Empty state (all good):**
```
✅ (large green checkmark animation)
ทุกคนได้รับการดูแลดีแล้ว 🙏
ยอดเยี่ยม! ทีมของคุณกำลังทำงานอย่างดี
```

### 4.16 AI Chat Widget (FAB, global)

**UX Goal:** "เหมือนมีผู้ช่วยอยู่ตลอดเวลา ไม่รบกวนถ้าไม่ต้องการ"

**FAB (fixed bottom-right):**
- 52px circle, above mobile tabs (bottom: 76px on mobile, 24px on desktop)
- Gradient: `spirit → sky`
- **Closed state:** 🤖 emoji, pulse animation (glow expands/contracts 2.5s loop)
- Tooltip after 3s idle: "น้องพันธกิจ AI"
- **Open state:** Morphs to ✕ (rotate 90deg, 300ms)

**Chat panel (open state):**

```
┌─ CHAT PANEL (slides up from FAB) ───────────┐
│ [glass-2, rounded-2xl, shadow-xl]           │
│ 360px wide (desktop), 90vw (mobile)         │
│ max-h 70vh                                   │
│                                              │
│ ┌─ HEADER ────────────────────────────────┐ │
│ │ (🌟) น้องพันธกิจ AI        [⚙]          │ │
│ │     ● พร้อมช่วย                          │ │
│ └─────────────────────────────────────────┘ │
│                                              │
│ ┌─ MODE PILLS ────────────────────────────┐ │
│ │ [💬•] [📋] [📖] [🙏] [📊]               │ │
│ │ สนทนา  รายงาน บทเรียน อธิษฐาน วิเคราะห์  │ │
│ └─────────────────────────────────────────┘ │
│                                              │
│ ┌─ QUICK CHIPS ───────────────────────────┐ │
│ │ [สรุปสัปดาห์] [แนะนำบทเรียน] [...]     │ │
│ └─────────────────────────────────────────┘ │
│                                              │
│ ┌─ MESSAGES ──────────────────────────────┐ │
│ │ (🌟)                                     │ │
│ │ สวัสดีครับ น้องเอไอพร้อม...              │ │
│ │                                          │ │
│ │              สรุปสัปดาห์นี้หน่อย (user) │ │
│ │                                          │ │
│ │ (🌟) กำลังคิด... (typing dots)          │ │
│ └─────────────────────────────────────────┘ │
│                                              │
│ ┌─ INPUT ─────────────────────────────────┐ │
│ │ [พิมพ์ข้อความ...]                  [→]  │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

**Message styles:**
- **Bot:** left-aligned, max-w 85%, glass bg, `--line` border, rounded-xl (rounded-bl-sm)
  - `**bold**` → water color
  - Bible verse → cyan chip
  - Bullet → styled list
- **User:** right-aligned, sky gradient bg, white text, rounded-xl (rounded-br-sm)
- **Typing:** 3 dots bounce animation + "AI กำลังคิด..."

**Modes:**
- 💬 สนทนา: general chat
- 📋 รายงาน: summarize reports, generate weekly summary
- 📖 บทเรียน: suggest Bible lessons for current week
- 🙏 อธิษฐาน: write prayers for specific people/situations
- 📊 วิเคราะห์: analyze trends, suggest actions

**Integration:** Gemini AI via `server/api` route (never expose API key in client)

---

## 🗄️ PART 5: DATA MODEL (Supabase Schema)

> **CRITICAL:** This schema respects all 4 Locked Decisions:
> - Groups are in a regular table (Decision 1)
> - `body_id` is tenant key, `organization_id` nullable for future (Decision 2)
> - Weekly tables use `snapshot_at` + `superseded_by` pattern (Decision 3)
> - Attendance, Attitude, Visit are in 3 separate tables (Decision 4)

### 5.1 Schema Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    organizations (future)                    │
└────────┬────────────────────────────────────────────────────┘
         │ (nullable FK, not used in Phase 1)
┌────────▼────────┐
│     bodies      │  ← 6 bodies: เมือง1, เมือง2, สมเด็จ, ท่าคันโท, กุฉินารายณ์, คำใหญ่
└────────┬────────┘
         │
┌────────▼────────────────────────────────────────────────────┐
│                    Tenant-scoped tables                      │
│                    (all have body_id FK + RLS)               │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ care_groups  │  │   members    │  │   leaders    │      │
│  │ (dynamic!)   │  │              │  │              │      │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘      │
│         │                 │                                  │
│         │ ┌───────────────┼──────────────────┐               │
│         │ │               │                   │              │
│  ┌──────▼─▼──────┐  ┌────▼─────┐  ┌─────────▼────────┐    │
│  │   meetings    │  │  visits  │  │    attitude      │    │
│  │  (per event)  │  │ (events) │  │   assessments    │    │
│  └──────┬────────┘  └──────────┘  │  (periodic)      │    │
│         │                          └──────────────────┘    │
│  ┌──────▼──────────┐                                       │
│  │  attendance_    │                                       │
│  │    records      │                                       │
│  │  (per meeting)  │                                       │
│  └─────────────────┘                                       │
│                                                              │
│  ┌─────────────────┐  ┌─────────────────────┐              │
│  │ pillar_snapshots│  │ group_makj_snapshots│              │
│  │   (weekly,      │  │   (weekly,          │              │
│  │    immutable)   │  │    immutable)       │              │
│  └─────────────────┘  └─────────────────────┘              │
│                                                              │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │  meeting_reports│  │     alerts      │                  │
│  └─────────────────┘  │   (computed)    │                  │
│                        └─────────────────┘                  │
└──────────────────────────────────────────────────────────────┘
```

### 5.2 Core Tables

#### 5.2.1 `organizations` (future-ready, nullable)

```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  archived_at TIMESTAMPTZ
);

-- Phase 1: single org inserted
INSERT INTO organizations (name, code)
VALUES ('คริสตจักรชีวิตสุขสันต์กาฬสินธุ์', 'SUKHSAN');
```

#### 5.2.2 `bodies` (6 bodies)

```sql
CREATE TABLE bodies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),  -- nullable for phase 1
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,  -- 'body_1', 'body_2', ...
  color_hex TEXT NOT NULL,    -- '#3b82f6', etc.
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  archived_at TIMESTAMPTZ
);

INSERT INTO bodies (name, code, color_hex, sort_order, organization_id)
VALUES
  ('เมือง 1',      'body_1', '#3b82f6', 1, (SELECT id FROM organizations WHERE code='SUKHSAN')),
  ('เมือง 2',      'body_2', '#06b6d4', 2, (SELECT id FROM organizations WHERE code='SUKHSAN')),
  ('สมเด็จ',       'body_3', '#8b5cf6', 3, (SELECT id FROM organizations WHERE code='SUKHSAN')),
  ('ท่าคันโท',     'body_4', '#10b981', 4, (SELECT id FROM organizations WHERE code='SUKHSAN')),
  ('กุฉินารายณ์',   'body_5', '#f59e0b', 5, (SELECT id FROM organizations WHERE code='SUKHSAN')),
  ('คำใหญ่',       'body_6', '#ec4899', 6, (SELECT id FROM organizations WHERE code='SUKHSAN'));
```

#### 5.2.3 `care_groups` (DYNAMIC — Decision 1)

```sql
CREATE TABLE care_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  body_id UUID NOT NULL REFERENCES bodies(id),
  organization_id UUID REFERENCES organizations(id),
  code TEXT NOT NULL,           -- 'G01', 'G02', ... DISPLAY CODE ONLY
  leader_name TEXT NOT NULL,
  coordinator_name TEXT,
  coordinator_phone TEXT,

  meeting_day TEXT,             -- 'monday', 'tuesday', ...
  meeting_time TIME,
  village TEXT,
  subdistrict TEXT,
  district TEXT,
  province TEXT DEFAULT 'กาฬสินธุ์',
  lat NUMERIC(10, 6),
  lng NUMERIC(10, 6),

  coordinator_photo_url TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  archived_at TIMESTAMPTZ,

  UNIQUE(body_id, code)         -- code unique within body
);

CREATE INDEX idx_care_groups_body ON care_groups(body_id) WHERE archived_at IS NULL;
```

**Seed data (TLC-mission groups G01-G20):**
```sql
-- seed.sql — ONLY used on initial setup
INSERT INTO care_groups (body_id, code, leader_name, sort_order) VALUES
  ((SELECT id FROM bodies WHERE code='body_1'), 'G01', 'ผุสดี',        1),
  ((SELECT id FROM bodies WHERE code='body_1'), 'G02', 'เบญ',          2),
  ((SELECT id FROM bodies WHERE code='body_1'), 'G03', 'ปุนนาภา',       3),
  ((SELECT id FROM bodies WHERE code='body_2'), 'G04', 'ทัศนา',         4),
  ((SELECT id FROM bodies WHERE code='body_2'), 'G05', 'ดาวใจ',         5),
  -- ... G06-G20 (distribute by body assignment)
;
```

#### 5.2.4 `members`

```sql
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  body_id UUID NOT NULL REFERENCES bodies(id),
  organization_id UUID REFERENCES organizations(id),
  care_group_id UUID REFERENCES care_groups(id),  -- nullable (can be unassigned)

  -- Identity
  full_name TEXT NOT NULL,
  nickname TEXT,
  age INT,
  occupation TEXT,
  workplace TEXT,
  family_status TEXT,

  -- Faith journey
  believed_at DATE,
  responsible_person TEXT,

  -- Goals
  goal_text TEXT,
  goal_quarter TEXT CHECK (goal_quarter IN ('Q1','Q2','Q3','Q4') OR goal_quarter IS NULL),

  -- Contact
  phone TEXT,
  line_id TEXT,
  avatar_url TEXT,

  -- Flags
  is_guest BOOLEAN DEFAULT false,  -- TRUE for one-time visitors
  is_active BOOLEAN DEFAULT true,

  -- Meta
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  archived_at TIMESTAMPTZ
);

CREATE INDEX idx_members_body ON members(body_id) WHERE archived_at IS NULL;
CREATE INDEX idx_members_group ON members(care_group_id) WHERE archived_at IS NULL;
```

**Note:** NO `attitude` column here. Attitude lives in separate table (Decision 4).
**Note:** NO `attendance_rate` column. Computed from `attendance_records` (Decision 4).

#### 5.2.5 `leaders` (leadership pipeline)

```sql
CREATE TABLE leaders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  body_id UUID NOT NULL REFERENCES bodies(id),
  organization_id UUID REFERENCES organizations(id),
  member_id UUID REFERENCES members(id),    -- may reference member, may be external

  full_name TEXT NOT NULL,      -- denormalized for those not in members table
  role TEXT NOT NULL CHECK (role IN ('หนบ.', 'หนค.', 'พล.1', 'พล.2')),

  -- For "กำลังสร้าง" pipeline
  pipeline_stage TEXT CHECK (pipeline_stage IN ('เริ่มสร้าง', 'กำลังพัฒนา', 'ใกล้พร้อม', 'พร้อมแต่งตั้ง')),
  target_role TEXT CHECK (target_role IN ('หนบ.', 'หนค.', 'พล.1', 'พล.2')),

  appointed_at DATE,
  mentor_id UUID REFERENCES leaders(id),    -- self-reference for coaching chain

  created_at TIMESTAMPTZ DEFAULT now(),
  archived_at TIMESTAMPTZ
);

CREATE INDEX idx_leaders_body_role ON leaders(body_id, role) WHERE archived_at IS NULL;
```

### 5.3 Domain 1: Attendance (Decision 4)

#### 5.3.1 `meetings`

```sql
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  body_id UUID NOT NULL REFERENCES bodies(id),
  organization_id UUID REFERENCES organizations(id),
  care_group_id UUID NOT NULL REFERENCES care_groups(id),

  meeting_date DATE NOT NULL,
  week_number INT NOT NULL,
  iso_year INT NOT NULL,

  -- Per meeting details
  topic TEXT,
  bible_reference TEXT,
  location TEXT,
  reporter_name TEXT,

  -- Aggregates (denormalized for speed, computed from attendance_records)
  present_count INT DEFAULT 0,
  leave_count INT DEFAULT 0,
  absent_count INT DEFAULT 0,
  guest_count INT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_meetings_group_week ON meetings(care_group_id, week_number, iso_year);
```

#### 5.3.2 `attendance_records`

```sql
CREATE TYPE attendance_status AS ENUM ('present', 'leave', 'absent');

CREATE TABLE attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  body_id UUID NOT NULL REFERENCES bodies(id),
  organization_id UUID REFERENCES organizations(id),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id),

  status attendance_status NOT NULL,
  note TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(meeting_id, member_id)   -- one record per member per meeting
);

CREATE INDEX idx_attendance_member ON attendance_records(member_id);
CREATE INDEX idx_attendance_meeting ON attendance_records(meeting_id);
```

**ONLY attendance fields here — no attitude, no visit info.**

### 5.4 Domain 2: Attitude (Decision 4)

#### 5.4.1 `attitude_assessments`

```sql
CREATE TYPE attitude_level AS ENUM ('ดี', 'ปานกลาง', 'น้อย');

CREATE TABLE attitude_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  body_id UUID NOT NULL REFERENCES bodies(id),
  organization_id UUID REFERENCES organizations(id),
  member_id UUID NOT NULL REFERENCES members(id),

  level attitude_level NOT NULL,
  effective_date DATE NOT NULL,        -- when this assessment takes effect
  assessed_by_name TEXT NOT NULL,
  assessment_period TEXT,              -- 'Q1 2026', 'monthly-2026-03', etc.

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_attitude_member_date ON attitude_assessments(member_id, effective_date DESC);
```

**Query current attitude:**
```sql
-- Current attitude per member (latest assessment)
SELECT DISTINCT ON (member_id)
  member_id, level, effective_date, assessed_by_name
FROM attitude_assessments
ORDER BY member_id, effective_date DESC;
```

**ONLY attitude fields here — no attendance, no visits.**

### 5.5 Domain 3: Visits (Decision 4)

#### 5.5.1 `visit_records`

```sql
CREATE TYPE visit_result AS ENUM ('พบตัว', 'ไม่อยู่', 'นัดใหม่', 'ทางโทรศัพท์', 'ทาง LINE');

CREATE TABLE visit_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  body_id UUID NOT NULL REFERENCES bodies(id),
  organization_id UUID REFERENCES organizations(id),
  member_id UUID NOT NULL REFERENCES members(id),

  visit_date DATE NOT NULL,
  visited_by_name TEXT NOT NULL,
  result visit_result NOT NULL,

  topic TEXT,
  notes TEXT,
  next_action TEXT,
  next_action_date DATE,

  prayer_generated_by_ai TEXT,   -- if AI wrote a prayer for this visit
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_visits_member_date ON visit_records(member_id, visit_date DESC);
```

**ONLY visit events here — no attendance link, no attitude rating.**

### 5.6 Weekly Snapshots (Decision 3 — Immutable)

#### 5.6.1 `pillar_snapshots` (8 pillars, weekly, body-level)

```sql
CREATE TABLE pillar_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  body_id UUID NOT NULL REFERENCES bodies(id),
  organization_id UUID REFERENCES organizations(id),

  week_number INT NOT NULL,         -- ISO week 1-53
  iso_year INT NOT NULL,

  pillar_1 INT NOT NULL DEFAULT 0,  -- การประกาศ
  pillar_2 INT NOT NULL DEFAULT 0,  -- การติดตามผล
  pillar_3 INT NOT NULL DEFAULT 0,  -- การอภิบาล
  pillar_4 INT NOT NULL DEFAULT 0,  -- สร้างผู้นำ
  pillar_5 INT NOT NULL DEFAULT 0,  -- อธิษฐานพุธ
  pillar_6 INT NOT NULL DEFAULT 0,  -- พพช.
  pillar_7 INT NOT NULL DEFAULT 0,  -- มาคจ.
  pillar_8 INT NOT NULL DEFAULT 0,  -- มาแคร์

  -- Goal values (can override defaults if needed)
  goal_1 INT, goal_2 INT, goal_3 INT, goal_4 INT,
  goal_5 INT, goal_6 INT, goal_7 INT, goal_8 INT,

  recorded_by_user_id UUID,
  recorded_by_name TEXT,

  snapshot_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  superseded_by UUID REFERENCES pillar_snapshots(id),   -- self-FK for immutable pattern

  CONSTRAINT valid_week CHECK (week_number BETWEEN 1 AND 53)
);

CREATE INDEX idx_pillar_body_week ON pillar_snapshots(body_id, iso_year, week_number)
  WHERE superseded_by IS NULL;
```

#### 5.6.2 `group_makj_snapshots` (per-group มาคจ., weekly)

```sql
CREATE TABLE group_makj_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  body_id UUID NOT NULL REFERENCES bodies(id),
  organization_id UUID REFERENCES organizations(id),
  care_group_id UUID NOT NULL REFERENCES care_groups(id),

  week_number INT NOT NULL,
  iso_year INT NOT NULL,

  makj_count INT NOT NULL,          -- จำนวนคนที่มาคริสตจักรสัปดาห์นี้ (group-level)
  size_classification TEXT GENERATED ALWAYS AS (
    CASE
      WHEN makj_count >= 12 THEN 'BIG'
      WHEN makj_count >= 7  THEN 'STD'
      WHEN makj_count >= 1  THEN 'MINI'
      ELSE 'EMPTY'
    END
  ) STORED,

  recorded_by_name TEXT,
  snapshot_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  superseded_by UUID REFERENCES group_makj_snapshots(id),

  CONSTRAINT valid_week CHECK (week_number BETWEEN 1 AND 53),
  CONSTRAINT non_negative CHECK (makj_count >= 0)
);

CREATE INDEX idx_makj_group_week ON group_makj_snapshots(care_group_id, iso_year, week_number)
  WHERE superseded_by IS NULL;
CREATE INDEX idx_makj_body_week ON group_makj_snapshots(body_id, iso_year, week_number)
  WHERE superseded_by IS NULL;
```

**Edit pattern (not update):**
```sql
-- To "edit" a snapshot:
BEGIN;
  INSERT INTO group_makj_snapshots (
    body_id, care_group_id, week_number, iso_year, makj_count, recorded_by_name
  ) VALUES ($1, $2, $3, $4, $5, $6)
  RETURNING id INTO new_id;

  UPDATE group_makj_snapshots
  SET superseded_by = new_id
  WHERE care_group_id = $2
    AND week_number = $3
    AND iso_year = $4
    AND superseded_by IS NULL
    AND id != new_id;
COMMIT;
```

### 5.7 Meeting Reports

```sql
CREATE TABLE meeting_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  body_id UUID NOT NULL REFERENCES bodies(id),
  organization_id UUID REFERENCES organizations(id),
  meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL,
  care_group_id UUID NOT NULL REFERENCES care_groups(id),

  week_number INT NOT NULL,
  iso_year INT NOT NULL,
  report_date DATE NOT NULL,

  -- Content (from 5-step wizard)
  bible_reference TEXT,
  bible_verse_text TEXT,
  key_points JSONB,              -- array of strings
  activities JSONB,              -- array of activity types
  takeaways JSONB,               -- array of strings
  special_notes TEXT,

  -- Photos
  photos JSONB,                  -- array of { url, caption, category }

  -- AI-generated summary (if used)
  ai_summary TEXT,
  ai_summary_used BOOLEAN DEFAULT false,

  created_by_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_reports_group_week ON meeting_reports(care_group_id, iso_year, week_number);
```

### 5.8 Alerts (Computed View)

```sql
-- Alerts are COMPUTED from domain data, not stored permanently
CREATE OR REPLACE VIEW current_alerts AS
SELECT
  m.id as member_id,
  m.body_id,
  m.full_name,
  m.care_group_id,
  cg.code as group_code,

  -- Attitude (from attitude_assessments)
  latest_attitude.level as current_attitude,
  latest_attitude.effective_date as attitude_date,

  -- Visit (from visit_records)
  latest_visit.visit_date as last_visit_date,
  (CURRENT_DATE - latest_visit.visit_date) as days_since_visit,

  -- Attendance (from attendance_records)
  recent_attendance.attendance_rate,

  -- Severity classification
  CASE
    WHEN latest_attitude.level = 'น้อย'
         AND (CURRENT_DATE - COALESCE(latest_visit.visit_date, '1900-01-01'::date)) > 30
      THEN 'critical'
    WHEN recent_attendance.attendance_rate < 0.5
         OR (CURRENT_DATE - COALESCE(latest_visit.visit_date, '1900-01-01'::date)) > 45
      THEN 'warning'
    WHEN latest_attitude.level IS NULL
         OR m.age IS NULL
      THEN 'missing_data'
    ELSE 'ok'
  END as severity

FROM members m
LEFT JOIN care_groups cg ON cg.id = m.care_group_id
LEFT JOIN LATERAL (
  SELECT level, effective_date
  FROM attitude_assessments
  WHERE member_id = m.id
  ORDER BY effective_date DESC LIMIT 1
) latest_attitude ON true
LEFT JOIN LATERAL (
  SELECT visit_date
  FROM visit_records
  WHERE member_id = m.id
  ORDER BY visit_date DESC LIMIT 1
) latest_visit ON true
LEFT JOIN LATERAL (
  SELECT
    COUNT(*) FILTER (WHERE status = 'present')::NUMERIC /
    NULLIF(COUNT(*), 0) as attendance_rate
  FROM attendance_records ar
  JOIN meetings mt ON mt.id = ar.meeting_id
  WHERE ar.member_id = m.id
    AND mt.meeting_date > CURRENT_DATE - INTERVAL '3 months'
) recent_attendance ON true

WHERE m.archived_at IS NULL;
```

### 5.9 Row-Level Security (RLS)

#### 5.9.1 Helper function

```sql
-- This function is the ONLY place where tenant resolution happens
-- Changing tenancy logic = update this function, no call-site changes needed
CREATE OR REPLACE FUNCTION current_tenant_body_id()
RETURNS UUID
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  user_email TEXT;
  body_code TEXT;
BEGIN
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();

  -- Pattern: body_1@mission.local → body_1
  body_code := split_part(user_email, '@', 1);

  RETURN (SELECT id FROM bodies WHERE code = body_code LIMIT 1);
END;
$$;
```

#### 5.9.2 RLS policies (apply to every tenant-scoped table)

```sql
-- Enable RLS
ALTER TABLE care_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE attitude_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE pillar_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_makj_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaders ENABLE ROW LEVEL SECURITY;

-- Policy template (apply to each)
CREATE POLICY "tenant_isolation_select" ON care_groups
  FOR SELECT USING (body_id = current_tenant_body_id());

CREATE POLICY "tenant_isolation_insert" ON care_groups
  FOR INSERT WITH CHECK (body_id = current_tenant_body_id());

CREATE POLICY "tenant_isolation_update" ON care_groups
  FOR UPDATE USING (body_id = current_tenant_body_id())
  WITH CHECK (body_id = current_tenant_body_id());

-- NO DELETE POLICY — use archived_at instead
-- (revoke delete privilege at role level)
REVOKE DELETE ON care_groups FROM authenticated;

-- Repeat for all tenant-scoped tables
-- (bodies itself is NOT RLS-protected — users need to see body info)
```

### 5.10 Storage Buckets (Supabase Storage)

```
storage/
├── avatars/           (public, member profile photos)
│   └── {body_id}/{member_id}.jpg
├── groups/            (public, group activity photos)
│   └── {body_id}/{group_id}/{timestamp}.jpg
└── reports/           (signed URLs, report attachments)
    └── {body_id}/{report_id}/{filename}
```

**Policies:**
- Upload: authenticated + body_id matches tenant
- Download: public for avatars/groups, signed URL for reports
- Max size: 5MB per image (auto-compressed client-side)

### 5.11 Migration Strategy

```
db/
├── migrations/
│   ├── 001_organizations_bodies.sql
│   ├── 002_care_groups.sql
│   ├── 003_members_leaders.sql
│   ├── 004_domain_attendance.sql        (meetings + attendance_records)
│   ├── 005_domain_attitude.sql          (attitude_assessments)
│   ├── 006_domain_visits.sql            (visit_records)
│   ├── 007_weekly_snapshots.sql         (pillar + makj snapshots)
│   ├── 008_meeting_reports.sql
│   ├── 009_alerts_view.sql
│   ├── 010_rls_policies.sql
│   └── 011_rls_tenant_function.sql
└── seed.sql                              (initial data: bodies + G01-G20 groups)
```

---

## ⚙️ PART 6: TECH STACK

### 6.1 Core Stack

| Layer | Choice | Why |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | Server Components + nested layouts + streaming |
| **Language** | TypeScript (strict mode) | Type safety for long-term maintainability |
| **Styling** | Tailwind CSS v4 | Utility-first + design tokens via `@theme` |
| **Components** | shadcn/ui + custom | Copy-paste primitives, full customization |
| **Icons** | Lucide React | Consistent, tree-shakeable |
| **Database** | Supabase (PostgreSQL) | Auth + RLS + realtime + storage in one |
| **ORM/Client** | `@supabase/ssr` | Server + client unified API |
| **State** | React Server Components + `useState`/`useReducer` | No Redux/Zustand needed for this scale |
| **Forms** | React Hook Form + Zod | Type-safe validation |
| **Charts** | Recharts | Best DX for React, dark theme friendly |
| **Maps** | Leaflet + react-leaflet | Free, OpenStreetMap |
| **AI** | Google Gemini API (server-side only) | Cost-effective for Thai language |
| **Deploy** | Vercel | Integrated with Next.js |
| **Notifications** | Sonner | Elegant toast library |
| **PDF** | `@react-pdf/renderer` | Server-side PDF generation |
| **LINE** | LINE Share API + LINE Notify | Public share + push notifications |

### 6.2 Package.json Core Dependencies

```json
{
  "name": "oikos-mission",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "supabase:migrate": "supabase db push",
    "supabase:types": "supabase gen types typescript --linked > src/types/database.types.ts"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "typescript": "^5.4.0",
    "@supabase/ssr": "^0.5.0",
    "@supabase/supabase-js": "^2.45.0",
    "tailwindcss": "^4.0.0",
    "lucide-react": "^0.400.0",
    "react-hook-form": "^7.51.0",
    "@hookform/resolvers": "^3.3.0",
    "zod": "^3.23.0",
    "recharts": "^2.12.0",
    "sonner": "^1.4.0",
    "date-fns": "^3.6.0",
    "leaflet": "^1.9.0",
    "react-leaflet": "^4.2.0",
    "@react-pdf/renderer": "^3.4.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.12.0",
    "@types/react": "^18.3.0",
    "@types/leaflet": "^1.9.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "^15.0.0",
    "vitest": "^1.6.0",
    "@testing-library/react": "^15.0.0"
  }
}
```

### 6.3 Folder Structure

```
oikos-mission/
├── src/
│   ├── app/                              # Next.js App Router
│   │   ├── (auth)/
│   │   │   └── login/page.tsx
│   │   ├── (app)/                        # authenticated layout
│   │   │   ├── layout.tsx                # sidebar + bottom tabs
│   │   │   ├── page.tsx                  # dashboard
│   │   │   ├── entry/
│   │   │   │   ├── weekly-pillars/page.tsx
│   │   │   │   ├── weekly-makj/page.tsx
│   │   │   │   └── attendance/[groupId]/page.tsx
│   │   │   ├── groups/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── edit/page.tsx
│   │   │   │   │   └── report/new/page.tsx
│   │   │   │   └── new/page.tsx
│   │   │   ├── members/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/page.tsx
│   │   │   │   └── new/page.tsx
│   │   │   ├── leaderboard/page.tsx
│   │   │   ├── leaders/page.tsx
│   │   │   ├── trends/page.tsx
│   │   │   ├── prayer-school/page.tsx
│   │   │   ├── care/page.tsx
│   │   │   ├── reports/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   └── settings/page.tsx
│   │   ├── api/
│   │   │   ├── ai/chat/route.ts          # Gemini proxy (server-only)
│   │   │   ├── ai/summarize/route.ts
│   │   │   ├── ai/prayer/route.ts
│   │   │   ├── ai/lesson/route.ts
│   │   │   └── reports/pdf/[id]/route.ts
│   │   ├── layout.tsx                    # root layout (fonts, theme)
│   │   ├── globals.css                   # design tokens, tailwind directives
│   │   └── not-found.tsx
│   │
│   ├── components/
│   │   ├── ui/                           # shadcn/ui primitives
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   └── ...
│   │   ├── shared/                       # cross-page components
│   │   │   ├── GlassCard.tsx
│   │   │   ├── AttitudeBadge.tsx
│   │   │   ├── GroupCodePill.tsx
│   │   │   ├── SizeBadge.tsx             # BIG/STD/MINI
│   │   │   ├── Avatar.tsx                # with attitude gradient
│   │   │   └── EmptyState.tsx
│   │   ├── dashboard/
│   │   │   ├── StatCrystal.tsx
│   │   │   ├── PillarCard.tsx
│   │   │   ├── AttitudeDonut.tsx
│   │   │   └── AlertFeed.tsx
│   │   ├── entry/
│   │   │   ├── PillarInputForm.tsx
│   │   │   ├── MakjQuickEntry.tsx
│   │   │   └── AttendanceMemberCard.tsx
│   │   ├── reports/
│   │   │   ├── ReportWizard.tsx
│   │   │   ├── StepProgress.tsx
│   │   │   └── ReportDocument.tsx        # LINE-ready view
│   │   ├── care/
│   │   │   ├── AlertCard.tsx
│   │   │   └── PriorityCard.tsx
│   │   ├── ai/
│   │   │   ├── AIChatFab.tsx
│   │   │   ├── AIChatPanel.tsx
│   │   │   └── AIMessage.tsx
│   │   └── layout/
│   │       ├── Sidebar.tsx
│   │       ├── BottomTabs.tsx
│   │       └── TopBar.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                 # browser client
│   │   │   ├── server.ts                 # server component client
│   │   │   └── middleware.ts             # auth middleware
│   │   ├── queries/                      # reusable query functions
│   │   │   ├── groups.ts
│   │   │   ├── members.ts
│   │   │   ├── attendance.ts             # domain 1
│   │   │   ├── attitude.ts               # domain 2
│   │   │   ├── visits.ts                 # domain 3
│   │   │   ├── snapshots.ts              # immutable snapshot helpers
│   │   │   └── alerts.ts
│   │   ├── actions/                      # Server Actions
│   │   │   ├── groups.ts
│   │   │   ├── members.ts
│   │   │   ├── attendance.ts
│   │   │   ├── attitude.ts
│   │   │   ├── visits.ts
│   │   │   └── snapshots.ts
│   │   ├── ai/
│   │   │   ├── gemini.ts                 # Gemini client setup
│   │   │   └── prompts.ts                # prompt templates
│   │   ├── utils/
│   │   │   ├── week.ts                   # ISO week helpers
│   │   │   ├── thai-date.ts              # Buddhist Era conversion
│   │   │   ├── classify-size.ts          # BIG/STD/MINI
│   │   │   └── cn.ts                     # className helper
│   │   └── constants.ts
│   │
│   ├── hooks/
│   │   ├── useCurrentTenant.ts
│   │   ├── useDebouncedCallback.ts
│   │   └── useAutoSaveDraft.ts
│   │
│   ├── types/
│   │   ├── database.types.ts             # Supabase generated
│   │   └── domain.ts                     # app-specific types
│   │
│   └── styles/
│       └── globals.css
│
├── public/
│   ├── fonts/                            # self-hosted fallback
│   └── icons/
│
├── db/
│   ├── migrations/
│   └── seed.sql
│
├── supabase/
│   └── config.toml
│
├── .env.local.example
├── .env.local
├── next.config.ts
├── tailwind.config.ts                    # or CSS-based config in v4
├── tsconfig.json
├── package.json
├── README.md
└── CLAUDE.md                             # ← THIS BLUEPRINT (for Claude Code context)
```

### 6.4 Tenant Access Pattern (Decision 2)

```ts
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function getSupabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}

// src/lib/auth/tenant.ts
export async function getCurrentTenant() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  // Single place where body_id resolution lives
  // Change this to switch to multi-level tenancy later
  const { data: body } = await supabase
    .from('bodies')
    .select('id, name, code, color_hex, organization_id')
    .eq('code', user.email!.split('@')[0])
    .single();

  if (!body) throw new Error('Body not found');

  return {
    userId: user.id,
    userEmail: user.email!,
    bodyId: body.id,
    bodyName: body.name,
    bodyCode: body.code,
    bodyColor: body.color_hex,
    organizationId: body.organization_id,  // nullable now, used later
  };
}
```

**Never do this at call sites:**
```ts
// ❌ WRONG — scattered tenant logic
const { data } = await supabase
  .from('members')
  .select('*')
  .eq('body_id', user.email.replace('@mission.local', ''));
```

**Always do this:**
```ts
// ✅ RIGHT — RLS handles it, tenant function is single source of truth
const { data } = await supabase
  .from('members')
  .select('*');
// RLS policy automatically applies: WHERE body_id = current_tenant_body_id()
```

### 6.5 Environment Variables

```bash
# .env.local.example

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...             # server-only, for admin tasks

# Google Gemini (server-only)
GEMINI_API_KEY=AIza...
GEMINI_MODEL=gemini-1.5-flash

# LINE
LINE_NOTIFY_TOKEN=                          # optional, for /api/notify
NEXT_PUBLIC_LINE_SHARE_URL_BASE=https://social-plugins.line.me/lineit/share

# App
NEXT_PUBLIC_APP_URL=https://oikos-mission.vercel.app
```

---

## 🗓️ PART 7: IMPLEMENTATION ROADMAP

### Phase 1: Foundation + Core MVP (Weeks 1-4)

**Goal:** หนค. สามารถกรอกข้อมูลรายสัปดาห์ได้ครบทั้ง 3 domains

- [ ] Setup Next.js 15 + Supabase + Tailwind + shadcn/ui
- [ ] Implement design tokens in `globals.css` (all CSS variables)
- [ ] Create core components: GlassCard, Button, Input, Badge, Avatar
- [ ] Database migrations 001-011 (all tables + RLS)
- [ ] Seed data: 6 bodies + 20 TLC-mission groups
- [ ] Auth: login page (Body tab + Admin tab)
- [ ] Dashboard (read-only, basic stats)
- [ ] `/groups` list + create + edit
- [ ] `/members` list + create + edit
- [ ] `/entry/weekly-makj` (quick entry for 20 groups)
- [ ] `/entry/attendance/[groupId]` (member check-in)

**Exit criteria:**
- หนค. กรอกมาคจ. 20 กลุ่มเสร็จใน 3 นาที
- Attendance บันทึกได้
- RLS ทำงาน (Body 1 เห็นเฉพาะ Body 1)

### Phase 2: Complete Domain Coverage (Weeks 5-8)

**Goal:** ครบ 3 domains + รายงานสัปดาห์

- [ ] `/entry/weekly-pillars` (8 pillars form)
- [ ] Attitude assessment form (separate page)
- [ ] Visit record form (separate page)
- [ ] Member profile page with 3 separated timelines
- [ ] `/reports/[id]` (LINE-ready detail view)
- [ ] 5-step report wizard
- [ ] PDF export
- [ ] LINE share integration
- [ ] `/leaderboard` with top-3 animations
- [ ] `/care` alerts page with computed severity

**Exit criteria:**
- ครบ feature Mission CRM
- ส่งรายงานผ่าน LINE ได้
- Alerts แสดงคนที่ต้องดูแลถูกต้อง

### Phase 3: AI + Intelligence (Weeks 9-12)

**Goal:** AI assistant + automated insights

- [ ] `/api/ai/chat` Gemini proxy endpoint
- [ ] AI Chat FAB + panel widget
- [ ] Mode-specific prompts (สนทนา/รายงาน/บทเรียน/อธิษฐาน/วิเคราะห์)
- [ ] AI summary in report wizard
- [ ] AI lesson recommendations (weekly)
- [ ] AI prayer writer in care page
- [ ] `/trends` page with 12-week charts per pillar
- [ ] `/prayer-school` page
- [ ] `/leaders` pipeline page

**Exit criteria:**
- AI chat ตอบคำถามได้ถูกบริบท
- บทเรียนประจำสัปดาห์สร้างเองจาก AI

### Phase 4: Polish + Scale (Weeks 13-16)

- [ ] Mobile bottom tabs (final polish)
- [ ] PWA support (offline-first for entry screens)
- [ ] Auto-save drafts (localStorage fallback)
- [ ] Advanced filters on list pages
- [ ] Photo compression client-side
- [ ] Map view for group locations (Leaflet)
- [ ] Print stylesheets for reports
- [ ] a11y audit + fixes
- [ ] Performance: image optimization, bundle analysis
- [ ] Analytics (privacy-respecting — Plausible)
- [ ] User onboarding tour (first-time users)

### Phase 5 (Future): Multi-level Tenancy

Already schema-ready (Decision 2). Just need:
- [ ] Update `current_tenant_body_id()` → `current_tenant_context()` returning all levels
- [ ] Add organization selector for super-admins
- [ ] Update RLS policies to support multi-level scoping

---

## ✅ PART 8: CHECKLISTS

### 8.1 Micro-interactions Checklist

- [ ] Every button: press `scale(0.97)`, release `scale(1.0)` (100ms)
- [ ] Every input: focus ring appears (200ms)
- [ ] Every card: hover lift `translateY(-2px)` (200ms)
- [ ] Every checkbox toggle: bounce `scale(0 → 1.2 → 1)` (200ms)
- [ ] Every toast: slide in from bottom-right (300ms)
- [ ] Every page transition: fade-up (300ms)
- [ ] Every number: count-up on mount (800ms)
- [ ] Every stat card: stagger 80ms delay
- [ ] Loading spinner: continuous 360deg (600ms linear infinite)
- [ ] Skeleton shimmer: 1.5s infinite
- [ ] Success toast: growth color, checkmark icon, 3s auto-dismiss
- [ ] Error toast: alert color, × icon, persists until dismissed
- [ ] Size badge: smooth color morph when count crosses threshold
- [ ] Attitude "น้อย" badge: pulse animation on dot
- [ ] Rose alert cards: subtle pulsing border
- [ ] AI FAB: pulse glow 2.5s loop (closed state)
- [ ] Save success: burst + green flash

### 8.2 Accessibility Checklist

- [ ] All buttons: min `44×44px` touch target
- [ ] All inputs: `aria-label` or associated `<label>`
- [ ] All icons: `aria-hidden="true"` + tooltip/title
- [ ] Color info: NEVER rely on color alone (add icon or text)
- [ ] Focus: visible ring on all interactive elements
- [ ] Contrast: `--text-main` on `--ink-mid` = 11:1 ratio ✓
- [ ] Error messages: `role="alert"` for screen readers
- [ ] Loading: `aria-busy="true"` during fetch
- [ ] Forms: error summary at top when submission fails
- [ ] Keyboard nav: Tab order logical, Escape closes modals
- [ ] `prefers-reduced-motion`: respect in all animations
- [ ] Skip link to main content
- [ ] Form labels visible (not placeholder-only)

### 8.3 Thai-specific Checklist

- [ ] All UI text in Thai
- [ ] Dates: Buddhist Era by default (ค.ศ. + 543)
- [ ] Month abbreviations: ม.ค. ก.พ. มี.ค. เม.ย. พ.ค. มิ.ย. ก.ค. ส.ค. ก.ย. ต.ค. พ.ย. ธ.ค.
- [ ] Full Thai month names: มกราคม กุมภาพันธ์ มีนาคม เมษายน พฤษภาคม มิถุนายน กรกฎาคม สิงหาคม กันยายน ตุลาคม พฤศจิกายน ธันวาคม
- [ ] Week day abbreviations: จ. อ. พ. พฤ. ศ. ส. อา.
- [ ] Thai numerals: optional display (keep Arabic by default for readability)
- [ ] Sarabun font loaded (Thai glyphs)
- [ ] Line-height 1.7+ for Thai body text (vertical breathing room for tone marks)
- [ ] No mid-word line breaks (use word-break: keep-all where appropriate)

### 8.4 4-Decision Compliance Audit

Run this audit before every PR:

**Decision 1 — Dynamic Groups:**
- [ ] No hardcoded `G01`, `G02`, etc. in code
- [ ] No `CareGroupCode` enum or union type
- [ ] Every groups list fetched from DB
- [ ] New group can be created via UI
- [ ] Archived groups hidden from active lists

**Decision 2 — Tenant Access:**
- [ ] No `.eq('body_id', ...)` in any call site
- [ ] All tenant resolution goes through `getCurrentTenant()`
- [ ] RLS policies active on all tenant tables
- [ ] `organization_id` column exists on all tenant tables (nullable)

**Decision 3 — Immutable Snapshots:**
- [ ] `UPDATE` on weekly snapshot tables is forbidden
- [ ] Every edit creates new row + sets `superseded_by`
- [ ] Queries use `DISTINCT ON (...) ORDER BY snapshot_at DESC`
- [ ] Historical data preserved (audit trail intact)

**Decision 4 — Separated Domains:**
- [ ] `attendance_records` has no attitude column
- [ ] `attitude_assessments` has no attendance/visit data
- [ ] `visit_records` has no attitude/attendance data
- [ ] Member profile shows 3 SEPARATE timelines (not merged)
- [ ] Attendance form does not ask for attitude
- [ ] Attitude form does not log meetings
- [ ] Alerts CAN combine signals across domains (this is OK — at query layer, not storage layer)

### 8.5 Performance Checklist

- [ ] Server Components by default (only `'use client'` when needed)
- [ ] `Suspense` boundaries around slow data fetches
- [ ] Images: `next/image` with proper sizes
- [ ] Icons: tree-shake unused Lucide icons
- [ ] Fonts: `next/font` for automatic subsetting
- [ ] Dynamic imports for heavy components (charts, maps)
- [ ] Indexes on all foreign keys in schema
- [ ] Connection pooling via Supabase (default)
- [ ] `revalidatePath` after mutations (not `revalidateTag` for simplicity)
- [ ] Avoid N+1 queries (use joins or `Promise.all`)
- [ ] Lighthouse score target: Performance ≥90, A11y 100, Best Practices ≥95

---

## 🎯 FINAL NOTES FOR CLAUDE CODE / ANTIGRAVITY

When using this blueprint:

1. **Always respect the 4 locked decisions.** They are not negotiable.
2. **Start with Phase 1.** Don't leapfrog to AI features before data plumbing is solid.
3. **Design tokens FIRST.** Set up `globals.css` with all CSS variables before any component.
4. **Server Components by default.** Only mark `'use client'` when truly needed (forms, interactivity).
5. **Supabase migrations in order.** Don't run `011_rls_policies.sql` before `002_care_groups.sql`.
6. **Thai language everywhere user-facing.** Code identifiers in English.
7. **Test with prefers-reduced-motion.** Animations should gracefully degrade.
8. **The tagline is the north star:** "ซับซ้อนข้างใน เรียบง่ายข้างนอก"

**One-line summary for any new engineer:**
> TLC-mission CRM เป็น church CRM ที่ใช้ Next.js + Supabase + Tailwind ออกแบบแบบ Deep Ocean Glass โดยมี 4 decisions ที่ต้องเคารพเสมอ: groups dynamic, body tenant with future-ready schema, weekly snapshots immutable, และ attendance/attitude/visit แยก 3 domain logic ออกจากกัน

---

**End of Blueprint**
🙏 ระบบนี้ช่วยทีมพันธกิจ ลดเวลาจาก 3 ชั่วโมง เหลือ 3 นาที
