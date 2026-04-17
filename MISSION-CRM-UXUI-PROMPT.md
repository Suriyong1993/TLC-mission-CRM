# 🎨 MISSION CRM — UX/UI PROMPT
## Vue 3 + Nuxt 3 | ออกแบบเพื่อทีมพันธกิจกาฬสินธุ์
## เน้น UX/UI ระดับ Production — ใช้งานได้จริง สวยจริง

---

```
You are a senior UX/UI designer + Vue 3 developer.
Build "Mission CRM" for Thai church mission teams in Kalasin.

Before writing any code, internalize this about the users:

WHO USES THIS SYSTEM:
  Church workers in rural Kalasin, Thailand
  Age range: 25–55 years old
  Device: mostly mobile phones (Android, mid-range)
  Tech level: basic — use LINE, Facebook daily
  Context: filling data after group meetings at night
  Pain: no system before, used Excel or paper notes
  Goal: simple enough to use in 5 minutes after each meeting

EMOTIONAL DESIGN TARGET:
  Feels like: a smart notebook that knows your team
  Not like: a corporate database or government form
  Warmth: spiritual warmth + modern confidence
  Tagline: "ซับซ้อนข้างใน เรียบง่ายข้างนอก"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DESIGN SYSTEM FOUNDATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COLORS — named by meaning, not by hex:

  --ink-deep:    #050d1a   /* deepest bg, like night sky */
  --ink-mid:     #0a1628   /* card background */
  --ink-lift:    #0f2444   /* hovered/raised surface */
  --ink-input:   #0d1e36   /* form fields */
  --line:        #1e3a5f   /* borders */
  --line-bright: #2d5a8e   /* active borders */

  --text-main:   #e8f4ff   /* primary text */
  --text-soft:   #7db4d8   /* labels, metadata */
  --text-ghost:  #3d6a8a   /* placeholders, hints */

  --sky:    #3b82f6   /* action, links, primary button */
  --water:  #06b6d4   /* growth metric, positive */
  --gold:   #f59e0b   /* harvest, weekly target */
  --growth: #10b981   /* new believers, success */
  --alert:  #f43f5e   /* care needed, urgent */
  --spirit: #8b5cf6   /* AI, admin, insights */

TYPOGRAPHY — Thai-first choices:

  Display numerics:  Kanit 800/900 — strong, confident
  UI labels:         Sarabun 500/600 — readable Thai
  Body text:         Sarabun 400 — comfortable reading
  Data/codes:        JetBrains Mono — clear numbers

  Scale:
    xs:  11px  tracking-wider uppercase  → labels, badges
    sm:  13px  → secondary info, metadata
    base:14px  → body text, form labels
    lg:  16px  → card titles
    xl:  20px  → section headers
    2xl: 28px  → page titles
    hero:48px  → big KPI numbers (Kanit 900)

SPACING — 4px base, use multiples:
  2, 4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48

RADIUS:
  sm: 6px   → badges, chips, small buttons
  md: 10px  → inputs, small cards
  lg: 14px  → main cards
  xl: 18px  → modals, panels
  full: 9999px → pills, avatars

ELEVATION (glass layers):
  Layer 0: transparent (page bg)
  Layer 1: glass card — rgba(10,22,40,0.75) blur(20px)
  Layer 2: glass raised — rgba(15,32,68,0.85) blur(24px)
  Layer 3: modal — rgba(5,13,26,0.95) blur(32px)

MOTION RULES:
  Fast (100ms):  hover color change, focus ring appear
  Normal (200ms): button press, toggle, badge appear
  Slow (300ms):  panel slide in, modal open, page transition
  Counting (800ms): number count-up on mount
  
  Easing: cubic-bezier(0.16, 1, 0.3, 1) for entries
  Never animate: layout shifts, text wrap changes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPONENT LANGUAGE — rules for every component
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CARDS:
  Always glass layer 1
  Rounded-lg (14px)
  Overflow hidden (for top gradient line)
  Entrance: fade-up with stagger delay (50ms per card)
  Hover: subtle scale(1.01) + shadow deepens
  Never: flat white background, hard shadows

TOP ACCENT LINE (every important card):
  2px gradient strip at top of card
  Blue→Cyan for data cards
  Gold→Orange for target/goal cards
  Rose→Orange for alert cards
  Purple→Pink for AI cards

BUTTONS:
  Primary:  gradient sky→water, white text, rounded-lg
            hover: brightness(1.1) + glow-sky shadow
            active: scale(0.97)
            loading: spinner replaces icon, text dims
  
  Secondary: glass bg, --line border, --text-soft
             hover: bg-ink-lift, text-main
  
  Ghost:    transparent, subtle border on hover only
  
  Danger:   gradient alert→orange, use only for delete
  
  Size rules:
    Mobile CTA: min-height 48px (thumb-friendly)
    Desktop: min-height 38px
    Icon-only: 36×36px square, rounded-md

INPUTS:
  Background: --ink-input
  Border: 1px --line
  Focus: border --sky + glow ring rgba(59,130,246,0.25)
  Font: Sarabun 14px --text-main
  Placeholder: --text-ghost
  Label: above input, 11px uppercase tracking-wider --text-soft
  Error: border --alert + red text below
  Height: 44px single-line (touch-friendly)

BADGES:
  Attitude ดี:         emerald bg/10 + emerald text + emerald border/30
                       with small green dot before text
  Attitude ปานกลาง:   gold bg/10 + gold text + gold border/30
  Attitude น้อย:       rose bg/10 + rose text + rose border/30
                       with pulse animation on dot (attention-grabbing)
  
  Frequency: small pills, color matches attendance level
  Week/Date: mono font, muted color, small

AVATARS:
  Circle with letter initial
  Background: gradient based on attitude
    ดี = emerald→teal gradient
    ปานกลาง = blue→indigo gradient  
    น้อย = rose→orange gradient
    unknown = gray→slate gradient
  Size sm=28px, md=40px, lg=56px
  On overlap (group): each shifts right 8px, white ring border

EMPTY STATES:
  Centered, 200px height minimum
  Large emoji (48px) with gentle float animation
  Thai message: encouraging tone, not "No data found"
  CTA button if action needed
  Example: "ยังไม่มีสมาชิก 👥\nเพิ่มสมาชิกคนแรกของกลุ่มได้เลยครับ"

LOADING STATES:
  Skeleton: shimmer animation
    background: linear-gradient(90deg, --ink-mid 25%, --ink-lift 50%, --ink-mid 75%)
    background-size: 200% 100%
    animation: shimmer 1.5s infinite
  Match skeleton shape to actual content (not generic bars)
  Show after 200ms delay (avoid flash for fast loads)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGE-BY-PAGE UX SPECIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

─────────────────────────────────
LOGIN PAGE
─────────────────────────────────

First impression goal: "ระบบนี้ดูดี น่าเชื่อถือ ใช้ง่าย"

BACKGROUND:
  Full viewport deep ink with mesh gradient
  Subtle dot grid texture (opacity very low)
  No animations on bg — calm, focused

CENTER CARD (max-w-440px, glass layer 2, glow-sky):
  
  HERO SECTION:
    Church icon in glowing circle
      Circle: 64px, gradient sky→water border
      Box-shadow: 0 0 0 4px rgba(59,130,246,0.15), glow-sky
      Icon: ⛪ or custom SVG, 28px
    
    Title: "ระบบติดตามกลุ่มพันธกิจ"
      Kanit 800, 22px, --text-main
      Letter-spacing: -0.02em (tight for display)
    
    Subtitle: "คริสตจักรกาฬสินธุ์ — 6 Body Network"  
      Sarabun 400, 13px, --text-ghost
  
  TAB SWITCHER (Body | Admin):
    2 pills, full width, glass bg
    Active: sky gradient bg, white text, slight glow
    Inactive: transparent, --text-soft
    Transition: 150ms, no jarring flash
  
  FORM FIELDS:
    Group select (Body tab):
      Custom dropdown — NOT native select
      Shows colored dot + body name in options
      Selected: body's color dot + name visible
    
    Password input:
      Lock icon left side (--text-ghost)
      Eye toggle right side (show/hide)
      On focus: border glows sky
    
    Submit button:
      Full width, 48px height
      Body tab: sky→water gradient
      Admin tab: spirit→sky gradient
      Loading: spinner + "กำลังเข้าสู่ระบบ..."
      Error shake animation on wrong password
  
  ERROR STATE:
    Rose text, fade in from top
    "รหัสผ่านไม่ถูกต้อง — ลองใหม่อีกครั้ง"
    Not an aggressive red box
  
  DEMO HINT (bottom, subtle):
    Glass box, ghost text, mono font for passwords
    Collapsible on mobile (tap to reveal)

─────────────────────────────────
SIDEBAR NAVIGATION
─────────────────────────────────

UX goal: "รู้ทันทีว่าอยู่ที่ไหน ไปไหนต่อได้เลย"

DESKTOP (w-64, fixed):
  
  TOP BRAND AREA (py-5 px-4):
    Logo row: glow circle + "พันธกิจ CRM" Kanit 800 16px
    Body badge pill:
      Background: body color at 15% opacity
      Border: body color at 40% opacity  
      Text: body color (full)
      Box-shadow: 0 0 12px bodyColor + 30% opacity
      Body name Sarabun 600 12px
  
  SECTION LABELS (px-4, mt-5 mb-1):
    11px Sarabun 600 uppercase tracking-[0.15em] --text-ghost
    "ภาพรวม", "บันทึก", "วิเคราะห์"
  
  NAV ITEMS (px-2):
    Height: 40px, rounded-lg, cursor-pointer
    Layout: flex items-center gap-3
    
    Icon container (28×28px, rounded-md):
      Inactive: --ink-lift bg, --text-soft icon
      Active: sky/10 bg, sky icon
    
    Label (Sarabun 500, 13px):
      Inactive: --text-soft
      Active: --text-main font-600
    
    Left accent bar:
      Position: absolute left-0, h-5, w-0.5, rounded-r
      Inactive: invisible
      Active: --sky background, visible
    
    Active bg: gradient from sky/10 → transparent (left to right)
    
    Notification dot (some items):
      Alerts: rose dot with count badge
      Lesson: gold dot when new week available
    
    Hover: bg --ink-lift, translate-x-0.5, 100ms
  
  BOTTOM USER CARD (px-3, py-3, border-t --line):
    Glass bg rounded-xl p-3
    Avatar circle (lg=40px, initials, gradient)
    Name: Sarabun 600 13px --text-main
    Role: "Body เมือง 1" 11px --text-ghost
    Logout button: right side, icon only
      Hover: rose color, tooltip "ออกจากระบบ"

MOBILE BOTTOM TABS:
  Fixed bottom, full width, 60px height
  Glass layer 2 + blur
  5 tabs: Home, สมาชิก, รายงาน, แจ้งเตือน, เพิ่มเติม
  
  Each tab:
    Icon (24px) + label (10px) centered
    Active: --sky color + 2px sky line at top
    Inactive: --text-ghost
    Tap feedback: scale(0.9) 100ms then back
  
  "เพิ่มเติม" opens bottom sheet with remaining items

─────────────────────────────────
DASHBOARD
─────────────────────────────────

UX goal: "เปิดมา 5 วินาที รู้ทันทีว่าสัปดาห์นี้เป็นยังไง"

STICKY HEADER (glass layer 1, transition on scroll):
  Left:
    "สวัสดีครับ 🙏" Sarabun 400 13px --text-ghost
    "[Body Name]" Kanit 800 22px --text-main
    "[วันที่] — สัปดาห์ที่ [X]" mono 12px --text-soft
  
  Right:
    Health Score mini ring (40px SVG)
      Colored arc based on score
      Number inside: Kanit 700 14px
    Live badge: "● ข้อมูลล่าสุด" pulsing green dot
    Refresh icon button (rotates on click)

HERO STATS ROW (horizontal scroll mobile):
  4 StatCrystal cards, min-w-[160px]
  
  Each card (glass layer 1, top-line, rounded-lg):
    Top-left: category emoji 20px
    
    MAIN NUMBER:
      Kanit 900, 48px, --text-main
      text-shadow: 0 0 20px currentColor (uses card's accent color)
      Count-up animation on mount (800ms, ease-out cubic)
    
    TREND BADGE (below number):
      ↑ +X% vs last month → growth/water color
      ↓ -X% vs last month → alert color
      → ไม่มีการเปลี่ยนแปลง → ghost color
    
    LABEL: 10px uppercase tracking-wider --text-ghost
    
    BACKGROUND ICON: card's emoji at 64px, opacity 0.04
      Position: bottom-right, -8px -8px
    
    Cards: กลุ่ม (sky), สมาชิก (water), ครั้งประชุม (spirit), ท่าทีน้อย (alert)
    Entrance: stagger 80ms per card, fade-up

QUARTERLY PROGRESS STRIP:
  Single glass card, full width
  "เป้าหมาย Q[X]" label left + "Q1|Q2|Q3|Q4" selector right
  
  4 mini bars in a row:
    Each: label + "X/Y" fraction + progress bar (6px) + % badge
    Bar fill: colored by % (>80%=growth, 50-79%=gold, <50%=alert)
    Animate bar width on mount

THIS WEEK'S LESSON (conditional):
  If no lesson chosen → gold-tinted glass card:
    "📖 บทเรียนสัปดาห์นี้ยังไม่ได้เลือก"
    Preview card from AI: verse + title
    "เลือกบทเรียน →" sky button
  
  If chosen → compact card:
    Verse ref (cyan) + title (white) + "📋 กรอกรายงาน →"

MIDDLE ROW (grid: 5/12 | 3/12 | 4/12):
  
  GROUP RADAR (5/12):
    Header: "🏠 กลุ่มทั้งหมด" + "ดูทั้งหมด →" link
    List rows (each group):
      Left: group code (mono, 10px, ghost) + name (13px, semi-bold)
      Right: member count pill + mini attendance bar (40px wide, 4px tall)
      Hover: bg lifts, right arrow appears
    Click row → navigate to /groups/[id]
  
  ATTITUDE DONUT (3/12):
    Custom SVG circle chart, 120px
    3 arcs: growth/gold/alert colors, gap between each
    Center: total members number Kanit 800 + "คน" small
    Animate arc draw on mount (stroke-dasharray)
    Legend: 3 rows below (dot + label + count)
  
  ALERT FEED (4/12):
    Header: "⚡ ต้องใส่ใจ" + badge count
    Feed items (max 5):
      Each: colored left border (severity) + message
      Rose: "เพ็ง ท่าทีน้อย 3 สัปดาห์แล้ว"
      Gold: "บ้านดอน ยังไม่มีรายงานสัปดาห์นี้"
      Sky: "มีสมาชิกใหม่รอเพิ่ม 2 คน"
    "ดูทั้งหมด →" footer link

CHARTS ROW (2 equal columns):
  
  VISIT TREND (recharts AreaChart):
    Title: "📈 เยี่ยมเยียน vs เป้าหมาย"
    Dark recharts theme:
      CartesianGrid: --line stroke, dashed
      XAxis/YAxis: --text-ghost, 10px, no line
    Cyan area with gradient fill (cyan at top → transparent)
    Gold dashed line: target
    Custom tooltip: glass card, Thai labels
    Responsive, 200px height
  
  ATTENDANCE BARS (recharts ComposedChart):
    Title: "👥 ผู้เข้าร่วมประชุม (8 ครั้งล่าสุด)"
    Blue bars + gold line overlay
    Bar hover: full column highlights
    200px height

QUICK ACTIONS (bottom, horizontal glass strip):
  4 action pills in a row:
  "+ บันทึกรายงาน" (sky)
  "+ เช็คชื่อ" (water)  
  "📊 รายงาน" (secondary)
  "🤖 ถาม AI" (spirit)
  
  Each: icon + label, 44px height, glass bg
  Hover: bg lifts + glow matching color
  Tap: scale(0.97) feedback

─────────────────────────────────
MEETING REPORTS — CREATE (5 STEPS)
─────────────────────────────────

UX goal: "กรอกได้ภายใน 3 นาที ไม่ต้องคิดว่าต้องกรอกอะไร"

PROGRESS INDICATOR:
  Top of form, sticky
  5 circles connected by line
  Done: filled sky circle + checkmark
  Current: pulsing sky ring
  Pending: ghost circle + number
  Line between: fills as steps complete

STEP 1 — เลือกกลุ่มและวันที่:
  
  SECTION: เลือกกลุ่ม
  Group cards (not dropdown!)
    Grid 2 cols on mobile, 3 on desktop
    Each card (glass, 80px height):
      Group code mono top-left
      Group name Kanit 700 center
      Meeting day + assignee chip bottom
      SELECTED: sky border + sky glow + sky top-line
      UNSELECTED: --line border, hover lifts
    
  SECTION: วันที่และสัปดาห์
  Date picker (native, styled to match design)
  Week number: auto-calculated, editable
  Reporter name: text input

STEP 2 — เช็คชื่อสมาชิก:
  
  HEADER BAR:
    Left: group name (selected)
    Right: live counter "X คน" in animated ring
      SVG circle, fills as people are checked
      Color: alert (0-50%) → gold (50-80%) → growth (80%+)
  
  MEMBER GRID (2 cols mobile, 3 desktop):
    Each member card (glass, 72px):
      UNCHECKED:
        Avatar circle left (40px)
        Name Sarabun 600 right + attitude badge below
        --line border
      
      CHECKED (tap animation):
        Background: growth/10 tint fills in (transition 200ms)
        Border: growth color
        Checkmark ✓ appears top-right (bounce animation)
        Avatar gets growth color overlay
      
      Tap feedback: scale(0.95) instant + ripple effect
  
  GUEST SECTION:
    "+ เพิ่มผู้มาใหม่ที่ยังไม่อยู่ในรายชื่อ" ghost button
    Name input → Enter adds chip
    Chips: ghost bg, "ใหม่" gold badge, × remove
  
  FOOTER: selected count + "ถัดไป →" button

STEP 3 — พระคำและบทเรียน:
  
  AI LESSON BUTTON (top, prominent):
    Glass card with spirit gradient left border
    "💡 ให้ AI แนะนำบทเรียนสัปดาห์นี้"
    → Opens bottom sheet with 3 lesson cards
    → Selecting one auto-fills all fields below
    → User can still edit
  
  BIBLE VERSE INPUT:
    Label: "ข้อพระคำ"
    Input: "เช่น ยอห์น 14:6" placeholder
    Below: VERSE TEXT textarea
      5 rows, auto-expand
      Styled as blockquote when filled:
        Left border gold 3px, bg gold/5, italic
  
  KEY POINTS (dynamic list):
    "🔑 ประเด็นสำคัญ" label
    Each item: numbered circle + text input + × remove
    "+ เพิ่มประเด็น" ghost button at bottom
    AI button: "🤖 เติมประเด็นจาก AI" small chip

STEP 4 — กิจกรรมและผลลัพธ์:
  
  ACTIVITIES CHECKBOXES:
    Horizontal chips grid (not vertical list!)
    Pre-filled: แบ่งปันพระคำ | แบ่งปันพระพร | อธิษฐาน
              นมัสการ | กิจกรรมกลุ่ม | อื่นๆ
    Checked chip: sky bg + white text + checkmark
    Unchecked: glass bg + ghost text
    Tap: toggles with 100ms animation
  
  TAKEAWAYS (dynamic list):
    "🎯 สิ่งที่ได้รับ / นำไปใช้" label
    Same pattern as key points
  
  SPECIAL NOTES:
    Textarea, "เรื่องพิเศษ หรือ หมายเหตุ (ถ้ามี)" placeholder
    Optional visual: faded "ไม่จำเป็น" hint
  
  AI SUMMARY BUTTON:
    Full width glass card, spirit border
    "🤖 ให้ AI ช่วยสรุปรายงานทั้งหมด"
    → Generates complete report from form data
    → Shows preview with "ใช้สรุปนี้ | แก้ไขเอง" options

STEP 5 — รูปภาพ:
  
  4 UPLOAD ZONES:
    Zone 1 (large, top): "📷 รูปกลุ่ม" — drag or tap
      When empty: dashed border, camera icon, label
      When filled: image preview full width
      Multiple: grid thumbnails
    
    Zone 2-4 (smaller, below): Slides | กิจกรรม | โปรไฟล์
      2 columns on mobile
      Each: dashed border 80px height, icon, label
      Filled: thumbnail + caption input below
    
    Upload progress: bar below each zone
    Compress notification: "🗜️ บีบอัดรูปเพื่อประหยัดพื้นที่" small text
  
  SKIP OPTION: "ข้ามขั้นตอนนี้ →" ghost link if no photos

BOTTOM NAVIGATION (sticky):
  "← ย้อนกลับ" (secondary) + "บันทึกรายงาน →" (primary)
  Auto-save indicator: "💾 บันทึกร่างอัตโนมัติ" small text

─────────────────────────────────
REPORT DETAIL PAGE
─────────────────────────────────

UX goal: "อ่านง่ายเหมือน newsletter ส่ง LINE ได้ทันที"

LAYOUT: Single column, max-w-640px, centered

DOCUMENT HEADER:
  "📋 รายงานพันธกิจประจำสัปดาห์" 11px uppercase label
  Group name: Kanit 800, 24px
  Date + Week: mono, ghost
  
  Action row (4 icons, right aligned):
    Share LINE | Download PDF | Copy Link | Print
    Each: 36px circle button, glass bg, icon

PHOTO GALLERY (if photos):
  Main group photo: full width, rounded-xl
  Additional: 3-col grid below, same height

ATTENDEE SECTION:
  "🏠 [Group Name]" header, Kanit 700
  "ผู้เข้าร่วม ([count] คน):" label
  
  AVATAR CHIPS ROW:
    Each person: avatar circle + name below
    Registered members: attitude color gradient
    Guests: ghost bg + "ใหม่" badge
    Overflow: "+X คน" chip

BIBLE VERSE SECTION:
  "📖 การแบ่งปันพระคำ" section header
    Bottom border: gradient sky→transparent
  
  Verse reference: "ยอห์น 14:6" sky, Kanit 600, 16px
  
  Verse text: blockquote style
    Left border: 3px solid gold
    Background: gold/5 rounded-r-xl
    Italic Sarabun, 15px, line-height 1.8
    Opening ❝ closing ❞ in large gold

KEY POINTS:
  "🔑 ประเด็นสำคัญ" header
  Numbered list:
    Each: circle badge (sky bg, white number Kanit 700)
         + text Sarabun 400 14px
    Space between items: 12px

ACTIVITIES:
  "🙏 กิจกรรมที่ทำ" header
  Horizontal chips: ✅ แบ่งปันพระคำ | ✅ อธิษฐาน...
  Growth tint chips, checkmark before each

TAKEAWAYS:
  "🎯 สิ่งที่ได้รับ / นำไปใช้" header
  Each: → arrow (sky) + text
  Subtle growth/5 background per item, left border

SPECIAL NOTES:
  "📝 เรื่องพิเศษ" header
  Content or "ไม่มีระบุเพิ่มเติม" ghost text
  If has content: amber/5 bg, left border amber

FIXED SHARE BAR (bottom, glass layer 2):
  Height 64px, safe area padding
  
  Row of 4 buttons:
  "📤 ส่ง LINE" (green #06c755, LINE brand color)
  "📄 PDF" (sky gradient)
  "🔗 แชร์ลิงก์" (secondary glass)
  "🖨️" (secondary glass, icon only)
  
  LINE button: slightly larger, most important action

─────────────────────────────────
MEMBER LIST + PROFILE
─────────────────────────────────

LIST PAGE:

FILTER BAR (glass, sticky top):
  Search: glass input, search icon, "ค้นหาชื่อ อาชีพ ที่อยู่..."
  Pills: ทุกกลุ่ม ▾ | ท่าทีทั้งหมด ▾ | ความถี่ ▾
  View toggle: ☰ ตาราง | ⊞ การ์ด
  
  STAT BAR below:
    Inline: "ดี [count] | ปานกลาง [count] | น้อย [count]"
    Colored dots before each, Sarabun 12px

TABLE VIEW:
  Sticky header row (glass bg)
  
  Each row (52px height):
    Left attitude accent bar (3px, full height)
    
    Col 1 — PERSON:
      Avatar (32px) + name Sarabun 600 + group name below (ghost, 11px)
    
    Col 2 — ATTITUDE:
      Badge pill (dot + text)
      ท่าทีน้อย: pulse animation on dot
    
    Col 3 — FREQUENCY:
      Mini progress indicator (4 dots, filled per frequency)
      Label below 10px
    
    Col 4 — LAST VISIT:
      >30 days: "45 วัน" rose badge with warning icon
      <7 days: "3 วัน" growth badge
      Never: "ยังไม่เยี่ยม" alert text
    
    Col 5 — ACTIONS (hidden, appear on hover):
      ✏️ แก้ไข | 👤 โปรไฟล์ | 📝 กิจกรรม
      Glass pill row, fade in 100ms
    
    Row hover: bg lifts, left accent glows

CARD VIEW (alternate):
  2-3 col grid
  Each card (glass, 160px):
    Avatar (48px) center-top
    Name Kanit 700 + group chip
    Attitude bar (mini, horizontal)
    Stats: เข้าร่วม X | เยี่ยม X | วันล่าสุด
    Action buttons (icon row, bottom)
    Hover: lift + glow by attitude color

PROFILE PAGE:

4 MINI STATS (top strip):
  ครั้งประชุม | ครั้งเยี่ยม | ปีรับเชื่อ | อายุ
  Each: Kanit 800 28px + label 10px

TWO COLUMNS:
  Personal info card (glass)
  Statistics + progress card (glass)

ATTENDANCE TIMELINE:
  Vertical line + event dots
  Green filled = attended
  Gray empty = absent
  Each: date label + week + topic

VISIT TIMELINE:
  Same style, colored by result
  Growth = พบตัว | Ghost = ไม่อยู่ | Sky = นัดใหม่

─────────────────────────────────
ALERTS — CARE INTELLIGENCE
─────────────────────────────────

UX goal: "เห็นแล้วรู้ทันทีว่าต้องดูแลใครก่อน"

PAGE TITLE: "🙏 ศูนย์การดูแล" — not "Alerts"

4 PRIORITY CARDS (top):
  Rose: "X คน ต้องดูแลด่วน" + mini avatar stack (top 3 faces)
  Gold: "X คน ไม่เยี่ยม >30 วัน"
  Spirit: "X คน ยังไม่มีข้อมูล"
  Growth: "X คน ท่าทีดี/ปานกลาง" (positive framing)
  
  Cards animate in stagger
  Rose card has subtle pulse animation (urgent)

CARE FEED (section headers + person cards):
  
  SECTION: "🔴 ต้องดูแลด่วน" (rose header)
  SECTION: "⚠️ เฝ้าระวัง" (gold header)
  SECTION: "💙 ยังขาดข้อมูล" (sky header)
  
  Each person card (horizontal glass, 72px):
    Left: attitude accent bar (severity width 4px)
    Avatar circle (44px) + glow by severity
    
    CENTER:
      Name Sarabun 600 14px
      Group chip (small)
      Reason tag: "ท่าทีน้อย 3 สัปดาห์" rose chip
      Last contact: "📅 เยี่ยมล่าสุด: 12 ก.พ." ghost text
    
    RIGHT:
      Days badge: "45 วัน" rose/gold pill
      Action buttons: "📝" | "🙏" icon buttons
        📝 → navigate to add activity (pre-filled)
        🙏 → open AI prayer writer for this person
  
  Card hover: lift + severity glow
  Rose cards: subtle pulsing border animation

EMPTY STATE (all good):
  ✅ large green checkmark animation
  "ทุกคนได้รับการดูแลดีแล้ว 🙏"
  Encouraging message

FLOATING ACTION (bottom-right when >5 alerts):
  "สร้างแผนเยี่ยม [X] คน" gold gradient button
  Opens print-ready visit list

─────────────────────────────────
AI CHAT WIDGET
─────────────────────────────────

UX goal: "เหมือนมีผู้ช่วยอยู่ตลอดเวลา ไม่รบกวนถ้าไม่ต้องการ"

FAB BUTTON (fixed bottom-right):
  52px circle, above mobile tabs (bottom: 76px on mobile)
  Gradient: spirit→sky
  
  CLOSED STATE:
    🤖 emoji (not text)
    Pulse animation: glow expands and contracts (2.5s loop)
    Small tooltip appears after 3s idle: "น้องพันธกิจ AI"
  
  OPEN STATE:
    Morphs to ✕ (rotate 90deg transition 300ms)
    Color changes: sky→alert gradient

CHAT PANEL (open state):
  Slides up from FAB (transform + opacity, 300ms)
  Width: 360px (desktop), 90vw (mobile)
  Max-height: 70vh
  glass layer 2, rounded-2xl
  Shadow: 0 20px 60px rgba(0,0,0,0.7)
  
  HEADER (glass layer 1 inside):
    Left: sparkle avatar (spirit gradient) + "น้องพันธกิจ AI"
         Status dot (green pulsing) + "พร้อมช่วย"
    Right: mode toggle (small), gear settings
  
  MODE PILLS (horizontal scroll):
    💬 สนทนา | 📋 รายงาน | 📖 บทเรียน | 🙏 อธิษฐาน | 📊 วิเคราะห์
    Active: spirit bg, white text, 10px font
  
  QUICK CHIPS (per mode, horizontal scroll):
    Small glass chips, tap to send as message
  
  MESSAGES AREA (scrollable, flex-col):
    
    BOT MESSAGE:
      Left aligned, max-w-85%
      Glass bg, --line border, rounded-xl rounded-bl-sm
      Text: Sarabun 13px --text-main, line-height 1.7
      Formatted: **bold** → water colored text
                 Bible verse → cyan chip
                 Bullet → styled list
    
    USER MESSAGE:
      Right aligned
      Sky gradient bg, white text
      Rounded-xl rounded-br-sm
    
    TYPING INDICATOR:
      3 dots, bounce animation, ghost color
      "AI กำลังคิด..." small text
  
  INPUT ROW (footer, glass):
    Textarea: auto-resize, max 4 rows
    Send button: circle, spirit gradient, → arrow
    Disabled when empty or loading

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MICRO-INTERACTIONS CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Every button: press scale(0.97), release scale(1.0)
Every input: focus ring appears (200ms)
Every card: hover lift (translateY -2px, 200ms)
Every check: bounce (scale 0→1.2→1, 200ms)
Every toast: slide in from bottom-right (300ms)
Every page transition: fade-up (300ms)
Every number: count-up on mount (800ms)
Every stat card: stagger 80ms delay
Loading spinner: continuous 360deg (600ms linear infinite)
Success toast: growth color, checkmark icon, 3s auto-dismiss
Error toast: alert color, × icon, persists until dismissed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACCESSIBILITY REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

All buttons: min 44×44px touch target
All inputs: aria-label or associated <label>
All icons: aria-hidden="true" + tooltip/title
Color info: never rely on color alone (add icon or text)
Focus: visible ring on all interactive elements
Contrast: --text-main on --ink-mid = 11:1 ratio ✓
Error messages: role="alert" for screen readers
Loading: aria-busy="true" during fetch

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TECH STACK (minimal, everything else same as before)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Vue 3 + Nuxt 3 + <script setup lang="ts">
Tailwind CSS (utility-first, no custom CSS except design tokens)
Pinia (state)
Supabase (@nuxtjs/supabase)
Gemini AI (server/api routes only)
Chart.js + vue-chartjs (dark theme)
Leaflet + ClientOnly wrapper (SSR fix)
Sonner or vue-toastification (toasts)

Data isolation: every query .eq('body_id', bodyId)
bodyId: useSupabaseUser().email.replace('@mission.local','')

Build and fix all TypeScript errors.
"ระบบนี้ช่วยทีมพันธกิจ ลดเวลาจาก 3 ชั่วโมง เหลือ 3 นาที" 🙏
```
