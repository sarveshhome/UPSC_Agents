# Reverse Prompt: Build a Production-Ready Question Management System for UPSC Master

Act as a Principal Python Architect, FastAPI Expert, Database Architect, and AI Systems Engineer.

Design and implement a complete backend architecture for a UPSC preparation platform called **UPSC Master** using **Python FastAPI**, **PostgreSQL**, **Cohere LLM**, and **Clean Architecture**.

The goal is to build an intelligent question delivery system that minimizes LLM usage, reuses existing questions, tracks user progress, and scales to millions of users.

---

## Core Business Requirement

When a user requests questions:

1. First search the database for available questions.
2. Exclude questions already attempted by the current user.
3. Return unattempted questions from the database.
4. Do NOT call Cohere if questions already exist.
5. If no unattempted questions exist for the user:

   * Generate new questions using Cohere LLM.
   * Generate:

     * Question
     * Options
     * Correct Answer
     * Explanation
     * Subject
     * Topic
     * Difficulty
   * Save all generated questions to the database.
   * Return the generated questions.
6. All AI-generated questions become part of the shared question pool and can be used by future users.

---

## User History Requirement

Store user-wise question history.

Track:

* UserId
* QuestionId
* Selected Option
* Correct/Incorrect Status
* Time Taken
* Attempt Date
* Bookmark Status

Requirements:

* Prevent duplicate questions for the same user.
* Generate analytics.
* Generate performance reports.
* Support AI recommendation systems in the future.

---

## Database Design

Generate a complete PostgreSQL schema.

Required tables:

### Users

Store:

* Id
* Name
* Email
* Target Exam Year

### Questions

Store:

* Id
* Subject
* Topic
* Difficulty
* Question Text
* Explanation
* Source (Database/Cohere)
* Created Date

### Question Options

Store:

* Id
* QuestionId
* Option Key
* Option Text
* Is Correct

### User Question History

Store:

* Id
* UserId
* QuestionId
* Selected Option
* Is Correct
* Time Taken
* Attempt Date

### AI Generation Log

Store:

* Prompt
* Response
* Subject
* Topic
* Difficulty
* Generated Date

Provide:

* ER Diagram
* Indexing Strategy
* Query Optimization Strategy

---

## Clean Architecture Requirements

Implement the solution using Clean Architecture.


Follow SOLID principles.

Use Dependency Injection.

Keep domain layer independent from infrastructure.

---

## API Requirements

### API 1: Get Questions

Endpoint:

```http
GET /api/v1/questions
```

Input:

```json
{
  "userId": "123",
  "subject": "Indian Polity",
  "topic": "Fundamental Rights",
  "difficulty": "Medium",
  "count": 10
}
```

Process:

1. Search database.
2. Exclude attempted questions.
3. Return available questions.
4. If unavailable:

   * Generate using Cohere.
   * Save.
   * Return.

Provide:

* Controller
* Request DTO
* Response DTO
* Use Case
* Repository Interface
* Repository Implementation

---

### API 2: Submit Answer

Endpoint:

```http
POST /api/v1/questions/submit
```

Input:

```json
{
  "userId": "123",
  "questionId": "456",
  "selectedOption": "A",
  "timeTaken": 20
}
```

Process:

1. Validate answer.
2. Save history.
3. Update user statistics.
4. Update analytics.

Generate complete implementation.

---

### API 3: Get User History

Endpoint:

```http
GET /api/v1/users/{userId}/history
```

Response:

```json
{
  "totalQuestions": 500,
  "correct": 420,
  "incorrect": 80,
  "accuracy": 84
}
```

Generate:

* Controller
* Service
* Repository
* SQL Queries

---

## Cohere Integration Requirements

Create a dedicated Cohere service.

Generate:

* Cohere Client
* Prompt Builder
* Response Parser
* Retry Policy
* Error Handling

Requirements:

* Questions must be returned in structured JSON.
* Generated questions must be automatically stored in PostgreSQL.
* Log every AI request in AI Generation Log.

---

## Repository Layer Requirements

Create repository interfaces for:

* QuestionRepository
* UserHistoryRepository
* AIGenerationRepository

Generate implementations using SQLAlchemy.

Include:

* CRUD Operations
* Pagination
* Filtering
* Bulk Insert

---

## Performance Optimization

Design and implement:

### Redis Cache

Cache:

* Frequently requested questions
* User dashboard statistics
* Analytics

Key examples:

```text
questions:polity:medium
user:123:stats
```

Provide:

* Cache Strategy
* TTL Strategy
* Cache Invalidation Logic

---

## Future AI Enhancements

Design extension points for:

* AI Recommendations
* AI Study Plans
* Weak Area Detection
* Smart Revision Planner
* AI Performance Forecasting

---

## Deliverables

Generate:

1. Complete Clean Architecture Design
2. FastAPI Folder Structure
3. PostgreSQL Schema
4. SQLAlchemy Models
5. Repository Interfaces
6. Repository Implementations
7. DTOs
8. Use Cases
9. Controllers
10. Dependency Injection Setup
11. Cohere Integration
12. Redis Integration
13. Unit Tests
14. Docker Configuration
15. Production Deployment Strategy

Output enterprise-grade, production-ready code and architecture that is scalable, maintainable, and optimized for AI cost reduction.


according to currect project change as appropriates