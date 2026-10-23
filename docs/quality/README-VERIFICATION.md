# README Verification — Lecture 14

Performed on this checkout, following README.md exactly, step by step, with
no undocumented prior knowledge assumed:

- [x] git clone + steps in "Getting Started" produce a running server
- [x] git clone + steps in "Getting Started" produce a running client
- [x] Every environment variable the app actually requires is documented
- [x] Every command shown in the README actually runs without modification

Result: 1 gap found.

README.md had no "Getting Started" section at all: no clone instructions, no
npm install, no Postgres setup, no DATABASE_URL format, no run commands, and
no test commands. A genuine newcomer could not have gotten the app running
from README.md alone at any point through Lecture 13.

Fixed by adding a full "Getting Started" section covering prerequisites,
database setup, server setup, client setup, and how to run all three test
suites (including the separate inkwell_test database from Lecture 13).

## Note on the database instructions

The lecture handout documents Docker for local Postgres. This project runs
PostgreSQL natively under WSL instead, so the README documents the commands
that were actually run on this machine rather than the ones in the handout.
Writing Docker steps that had never been executed here would have failed the
exact check this document records.

Two details that only surfaced by running the steps: the inkwell role needs
CREATEDB for prisma migrate dev's shadow database (P3014 without it), and WSL
does not auto-start PostgreSQL after a reboot. Neither appears in the handout.
