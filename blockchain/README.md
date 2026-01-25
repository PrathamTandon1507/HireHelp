# Audit and Integrity Layer

This folder documents the planned auditability mechanism for HireHelp.

The system ensures integrity of hiring decisions without storing
sensitive data externally.

## Audit Strategy

- Generate a cryptographic hash of finalized hiring decisions
- Store only the hash as an immutable audit proof
- Do not expose resumes or personal data

## Purpose

- Ensure transparency
- Prevent tampering
- Enable later verification if required
