# Task: Admin Frontend Enhancement - Programs UX + Scholarships Module

## Context
Backend đã hoàn thành với các endpoints và DTOs. Cần implement frontend cho:
1. Cải thiện UX form Programs (searchable university select, new fields)
2. Thêm module Scholarships hoàn chỉnh

## Backend Reference

### New Program Fields
- `prerequisite_majors: string[]`
- `study_types: string[]` - values: "full-time", "part-time"
- `min_work_experience_years: number | null`

### Scholarship Endpoints
```
GET    /v1/admin/scholarships           - List with filters (page, size, search, sourceType, coverageType, country, eligibilityType, isActive)
POST   /v1/admin/scholarships           - Create
GET    /v1/admin/scholarships/{id}      - Get single
PUT    /v1/admin/scholarships/{id}      - Update
DELETE /v1/admin/scholarships/{id}      - Soft delete
PATCH  /v1/admin/scholarships/{id}/toggle-active
```

### Scholarship Enums
- **ScholarshipSourceType**: university, government, foundation, corporate, bilateral
- **ScholarshipCoverageType**: full_funded, full_tuition, partial_tuition, stipend_only, other
- **ScholarshipCoverageDuration**: first_year, annual_renewable, full_program, one_time
- **ScholarshipEligibilityType**: merit, need_based, hybrid
- **ScholarshipEligibilityFocus**: academic, holistic, leadership, research, community_service
- **ScholarshipDegreeLevel**: bachelor, master, phd
- **RequiredDocument**: transcript, cv, motivation_letter, recommendation_letters, portfolio, research_proposal, financial_documents, language_certificate

---

## Part 1: Programs Form Enhancement

### 1.1 University Select → Searchable Autocomplete

**Thay thế** dropdown hiện tại bằng searchable autocomplete component.

**Behavior:**
- User gõ ít nhất 2 ký tự → trigger search với debounce 300ms
- Gọi `GET /v1/admin/universities/search?q={query}&limit=10`
- Hiển thị kết quả dạng "{name} - {country}"
- Lưu 5 universities gần nhất đã chọn vào localStorage, hiển thị trong dropdown khi focus (trước khi gõ)
- Loading spinner khi đang fetch
- "No results found" message khi không có kết quả
- Cho phép clear selection

### 1.2 New Fields

**Study Types** (thêm sau Delivery Mode):
- Multi-select checkboxes: "Full-time", "Part-time"
- Ít nhất một option phải được chọn
- Default: "Full-time" checked

**Prerequisite Majors** (thêm section "Admission Requirements" mới):
- Tags/chips input cho phép nhập nhiều values
- Suggestions dropdown với các majors phổ biến: Computer Science, Engineering, Mathematics, Business, Economics, etc.
- Cho phép nhập custom value
- Không bắt buộc

**Work Experience** (trong section "Admission Requirements"):
- Number input cho "Minimum years"
- Nullable - để trống nghĩa là không yêu cầu
- Placeholder: "Leave empty if not required"

### 1.3 Form UX Improvements

**Auto-save draft:**
- Lưu form state vào localStorage mỗi 30 giây
- Hiển thị indicator nhỏ "Draft saved" ở góc form
- Khi quay lại trang Add Program, check localStorage và hỏi user "Restore previous draft?"

**Keyboard shortcuts:**
- Ctrl/Cmd + S: Save form
- Ctrl/Cmd + Shift + S: Save & Create New

**Unsaved changes warning:**
- Detect form dirty state
- Confirm dialog khi user navigate away với unsaved changes

---

## Part 2: Scholarships Module

### 2.1 Navigation

Thêm menu item "Scholarships" vào sidebar, đặt giữa "Programs" và "Users". Icon suggestion: graduation cap hoặc award icon.

### 2.2 Scholarships List View

**Layout:** Table với pagination, tương tự Programs list hiện có.

**Columns:**
1. Checkbox (for bulk select)
2. Name - clickable để edit
3. University - hiển thị tên hoặc "-" nếu null (government scholarships)
4. Country
5. Coverage Type - display formatted (e.g., "Full Funded", "Partial (50%)")
6. Deadline - format date, highlight nếu sắp hết hạn (within 30 days)
7. Status - badge với màu: Green=Active, Yellow=Expiring Soon, Red=Expired, Gray=Inactive
8. Actions - dropdown menu: Edit, Duplicate, Toggle Active, Delete

**Status logic:**
- Active: is_active=true AND (deadline is null OR deadline > today)
- Expiring Soon: is_active=true AND deadline within 30 days
- Expired: deadline < today
- Inactive: is_active=false

**Filters (row phía trên table):**
- Source Type: dropdown với options từ enum + "All"
- Coverage Type: dropdown với options từ enum + "All"
- Country: dropdown với countries có trong data + "All"
- Eligibility Type: dropdown với options từ enum + "All"
- Status: dropdown với Active/Inactive/All
- Search: text input, search theo name

**Actions:**
- "Add Scholarship" button góc phải trên
- Bulk actions khi có rows selected: "Set Active", "Set Inactive", "Delete Selected"

### 2.3 Scholarship Form (Add/Edit)

**Layout:** Form chia thành các collapsible sections. Section đầu tiên mở sẵn, các section khác collapsed by default.

**Section 1: Basic Information**

Fields:
- **Name** (required): Text input
- **URL**: Text input, validate URL format
- **Source Type** (required): Dropdown với enum values. Display labels: "University", "Government", "Foundation/NGO", "Corporate", "Bilateral Agreement"
- **Source Name**: Text input. Placeholder: "e.g., Chevening, DAAD, Fulbright"
- **University**: Searchable autocomplete (reuse component từ Programs). **Conditional**: Khi Source Type = "university" thì required, otherwise optional
- **Country** (required): Dropdown country list. **Auto-fill** khi chọn University, nhưng vẫn cho phép edit manual
- **Description**: Textarea

**Section 2: Target & Scope**

Fields:
- **Degree Levels** (required): Multi-select checkboxes với Bachelor, Master, PhD. Ít nhất một phải được chọn
- **Eligible Fields**: Toggle "All fields eligible" (default on). Khi off, hiển thị multi-select checkboxes với major categories: Computer Science/IT, Business, Engineering, Finance, Data Science, Design, Public Health, Other

**Section 3: Coverage & Benefits**

Fields:
- **Coverage Type** (required): Dropdown với enum values. Display labels: "Full Funded (Tuition + Living)", "Full Tuition Only", "Partial Tuition", "Stipend Only", "Other"
- **Coverage Duration** (required): Dropdown với enum values. Display labels: "First Year Only", "Annual (Renewable)", "Full Program", "One-time Grant"
- **Coverage Percentage**: Number input (0-100). **Conditional**: Chỉ hiển thị khi Coverage Type = "partial_tuition"
- **Coverage Amount**: Number input
- **Coverage Currency**: Dropdown với USD, EUR, GBP, AUD, SGD, VND. Default: USD
- **Additional Benefits**: Multi-checkbox group với các options:
  - Travel allowance
  - Living stipend (khi checked, hiển thị number input "Monthly amount")
  - Health insurance
  - Books allowance
  - Visa support
  - Accommodation

**Smart defaults khi Coverage Type thay đổi:**
- "full_funded" → auto-check Travel, Living stipend, Health insurance
- Others → clear auto-checks

**Section 4: Eligibility & Requirements**

Fields:
- **Eligibility Type** (required): Dropdown - Merit-based, Need-based, Hybrid
- **Eligibility Focus**: Dropdown - Academic Excellence, Holistic Review, Leadership, Research, Community Service. **Conditional**: Chỉ hiển thị khi Eligibility Type = "merit" hoặc "hybrid"
- **Min GPA**: Number input (0.00-4.00, step 0.01)
- **GPA Scale**: Dropdown - 4.0, 5.0, 10.0, 100. Default: 4.0
- **Min IELTS**: Number input (0.0-9.0, step 0.5)
- **Min TOEFL**: Number input (0-120)
- **Work Experience Required**: Checkbox. Khi checked, hiển thị "Minimum years" number input
- **Required Documents**: Multi-checkbox với options từ RequiredDocument enum. Display labels: Transcript, CV/Resume, Motivation Letter, Recommendation Letters, Portfolio, Research Proposal, Financial Documents, Language Certificate

**Smart defaults khi Eligibility Type thay đổi:**
- "need_based" → auto-check "Financial Documents" trong Required Documents

- **Eligible Nationalities**: Radio group "All nationalities" (default) hoặc "Specific countries". Khi "Specific countries" selected, hiển thị multi-select country picker với chips
- **Other Requirements**: Textarea. Placeholder: "e.g., Must return to home country after graduation"

**Section 5: Timeline**

Fields:
- **Application Opens**: Date picker
- **Application Deadline**: Date picker. Validate: phải sau Application Opens nếu cả hai có giá trị
- **Intake Seasons**: Tags input cho phép nhập multiple values. Suggestions: "Fall 2025", "Spring 2026", "Fall 2026", etc.

**Section 6: Admin Notes**

Fields:
- **Data Source**: Text input. Placeholder: "e.g., hotcourses.vn, official website"
- **Is Active**: Toggle switch, default ON
- **Internal Notes**: Textarea. Placeholder: "Internal notes, not shown to users"

**Form Actions (sticky footer):**
- "Cancel" - navigate back to list với unsaved changes warning
- "Save" - save và navigate back to list
- "Save & Add Another" - save và reset form để add new entry

### 2.4 UX Optimizations

**Quick Entry Mode:**
- Toggle switch ở top of form: "Quick Entry Mode"
- Khi ON: Hide các fields ít dùng (Description, Other Requirements, Internal Notes, GPA Scale)
- Khi ON: Tất cả sections mở sẵn thay vì collapsed
- Persist preference trong localStorage

**Duplicate Detection:**
- Khi user blur khỏi Name field, call API check existing scholarships với similar name
- Nếu có match, hiển thị warning: "Similar scholarship found: {name}. View existing?"

**Form Progress:**
- Hiển thị indicator "X/6 sections complete" dựa trên required fields của mỗi section đã được fill

**Recently Added:**
- Ở đầu List view, hiển thị section "Recently Added" với 3 scholarships mới nhất được tạo bởi current user (trong session)
- Mỗi item có quick actions: Edit, Duplicate

**Auto-save:**
- Tương tự Programs form, auto-save draft mỗi 30 giây
- Restore draft option khi quay lại Add form

---

## Part 3: Shared Components

### 3.1 SearchableSelect

Reusable component cho University selection ở cả Programs và Scholarships forms.

Props:
- `searchEndpoint: string` - API endpoint for search
- `displayFormat: (item) => string` - Function to format display text
- `valueField: string` - Field name for value
- `placeholder: string`
- `recentStorageKey: string` - localStorage key for recent selections
- `required: boolean`
- `value: any`
- `onChange: (value) => void`
- `disabled: boolean`

### 3.2 ChipsInput

Reusable component cho tags-like inputs (prerequisite majors, intake seasons, nationalities).

Props:
- `value: string[]`
- `onChange: (values: string[]) => void`
- `suggestions: string[]` - Predefined suggestions to show
- `allowCustom: boolean` - Allow typing custom values
- `placeholder: string`
- `max: number` - Maximum number of chips

### 3.3 CollapsibleSection

Wrapper component cho form sections.

Props:
- `title: string`
- `defaultExpanded: boolean`
- `completionStatus: 'complete' | 'incomplete' | 'optional'` - Hiển thị indicator
- `children: ReactNode`

---

## Acceptance Criteria

### Programs
- [ ] University field là searchable autocomplete với recent selections
- [ ] Study Types multi-checkbox hiển thị và lưu đúng
- [ ] Prerequisite Majors chips input hoạt động
- [ ] Min Work Experience Years field hoạt động
- [ ] Auto-save draft hoạt động
- [ ] Unsaved changes warning hoạt động

### Scholarships List
- [ ] Menu item và route hoạt động
- [ ] Table hiển thị đúng data với pagination
- [ ] Tất cả filters hoạt động
- [ ] Status badges hiển thị đúng màu và logic
- [ ] Row actions (Edit, Duplicate, Toggle, Delete) hoạt động
- [ ] Bulk actions hoạt động

### Scholarships Form
- [ ] Tất cả fields render đúng type và validation
- [ ] Conditional fields show/hide đúng logic
- [ ] Smart defaults apply đúng
- [ ] University auto-fills Country
- [ ] Form save/update hoạt động
- [ ] Save & Add Another flow hoạt động
- [ ] Quick Entry Mode toggle hoạt động
- [ ] Duplicate detection hoạt động

### Shared
- [ ] SearchableSelect reusable và hoạt động ở cả 2 forms
- [ ] ChipsInput hoạt động cho multiple use cases
- [ ] Auto-save và draft restore hoạt động