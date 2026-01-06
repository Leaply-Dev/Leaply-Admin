Scholarship Admin API - Frontend Integration Guide

  Base URL: /v1/admin/scholarships

  ---
  1. LIST - GET /v1/admin/scholarships

  Query Params:
  | Param            | Type    | Description                                                     |
  |------------------|---------|-----------------------------------------------------------------|
  | universityId     | UUID    | Filter by university                                            |
  | country          | string  | Filter by country                                               |
  | sourceType       | string  | university, government, foundation, corporate, bilateral        |
  | coverageType     | string  | full_funded, full_tuition, partial_tuition, stipend_only, other |
  | eligibilityType  | string  | merit, need_based, hybrid                                       |
  | isActive         | boolean | Filter active/inactive                                          |
  | search           | string  | Search by name                                                  |
  | page, size, sort | -       | Pagination                                                      |

  Response:
  {
    "success": true,
    "data": {
      "content": [ScholarshipAdminResponse],
      "totalElements": 100,
      "totalPages": 5,
      "number": 0
    }
  }

  ---
  2. GET ONE - GET /v1/admin/scholarships/{id}

  ---
  3. CREATE - POST /v1/admin/scholarships

  {
    "name": "DAAD Scholarship",           // required
    "url": "https://...",
    "description": "...",
    "universityId": "uuid-or-null",       // nullable for gov scholarships
    "country": "Germany",                 // auto-fill from university if not provided
    "sourceType": "government",           // default: "university"
    "sourceName": "DAAD",

    "degreeLevels": ["master", "phd"],    // required, at least 1
    "eligibleFields": ["engineering", "science"],  // null = all fields

    "coverageType": "full_funded",        // required
    "coveragePercentage": 100,            // for partial_tuition
    "coverageAmount": 15000,
    "coverageCurrency": "EUR",            // default: "USD"
    "coverageDuration": "full_program",   // default
    "additionalBenefits": {
      "travel": true,
      "living_stipend_monthly": 934,
      "health_insurance": true,
      "books": false,
      "visa_support": true
    },

    "eligibilityType": "merit",           // default
    "eligibilityFocus": "academic",       // academic, holistic, leadership, research, community_service

    "minGpa": 3.0,
    "gpaScale": 4.0,                      // default
    "minIelts": 6.5,
    "minToefl": 90,
    "workExperienceRequired": false,
    "minWorkExperienceYears": null,
    "requiredDocuments": ["transcript", "cv", "motivation_letter", "recommendation_letters"],
    "nationalityEligible": ["VN"],        // null = all nationalities
    "otherRequirements": "...",

    "applicationOpenDate": "2025-01-01",
    "applicationDeadline": "2025-06-30",
    "intakeSeasons": ["Fall 2025"],

    "isActive": true,
    "dataSource": "official_website",
    "notes": "Internal notes..."
  }

  ---
  4. UPDATE - PUT /v1/admin/scholarships/{id}

  Same fields as CREATE (all optional, only update provided fields)

  ---
  5. DELETE - DELETE /v1/admin/scholarships/{id}

  Soft delete

  ---
  6. TOGGLE ACTIVE - PATCH /v1/admin/scholarships/{id}/toggle-active

  Toggle isActive status

  ---
  ScholarshipAdminResponse

  {
    "id": "uuid",
    "name": "DAAD Scholarship",
    "url": "https://...",
    "description": "...",
    "universityId": "uuid-or-null",
    "universityName": "TU Munich",        // populated from relation
    "country": "Germany",
    "sourceType": "government",
    "sourceName": "DAAD",
    "degreeLevels": ["master", "phd"],
    "eligibleFields": ["engineering"],
    "coverageType": "full_funded",
    "coveragePercentage": 100,
    "coverageAmount": 15000,
    "coverageCurrency": "EUR",
    "coverageDuration": "full_program",
    "additionalBenefits": {...},
    "eligibilityType": "merit",
    "eligibilityFocus": "academic",
    "minGpa": 3.0,
    "gpaScale": 4.0,
    "minIelts": 6.5,
    "minToefl": 90,
    "workExperienceRequired": false,
    "minWorkExperienceYears": null,
    "requiredDocuments": ["transcript", "cv"],
    "nationalityEligible": ["VN"],
    "otherRequirements": "...",
    "applicationOpenDate": "2025-01-01",
    "applicationDeadline": "2025-06-30",
    "intakeSeasons": ["Fall 2025"],
    "isActive": true,
    "dataSource": "official_website",
    "dataVerifiedAt": "2025-01-07T10:00:00",
    "notes": "...",
    "createdAt": "2025-01-07T10:00:00",
    "updatedAt": "2025-01-07T10:00:00",
    "createdBy": "uuid",
    "updatedBy": "uuid"
  }

  ---
  Enum Values (for dropdowns)

  | Field             | Options                                                                                                                            |
  |-------------------|------------------------------------------------------------------------------------------------------------------------------------|
  | sourceType        | university, government, foundation, corporate, bilateral                                                                           |
  | coverageType      | full_funded, full_tuition, partial_tuition, stipend_only, other                                                                    |
  | coverageDuration  | first_year, annual_renewable, full_program, one_time                                                                               |
  | eligibilityType   | merit, need_based, hybrid                                                                                                          |
  | eligibilityFocus  | academic, holistic, leadership, research, community_service                                                                        |
  | degreeLevels      | bachelor, master, phd                                                                                                              |
  | requiredDocuments | transcript, cv, motivation_letter, recommendation_letters, portfolio, research_proposal, financial_documents, language_certificate |