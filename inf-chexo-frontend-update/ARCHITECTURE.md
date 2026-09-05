# CHEXO v3 Architecture

## Product boundary
CHEXO is a learning platform for Informatics, not a full school academic information system.

## Core
- Public learning pages
- Student portal
- Teacher portal
- Admin portal
- Materials
- Assignments / submissions / grades
- Quiz
- Playground
- Portfolio
- Learning progress

## Later / optional
- CBT
- Academic data integration
- Public API
- Native mobile application

## Backend direction
Supabase is the intended single backend for Auth, PostgreSQL and Storage. The old project contained Firebase, Nhost and Supabase references; v3 deliberately removes that architectural ambiguity from the foundation.
