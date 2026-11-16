-- V24: Track explicit finalization/submission of coding questions to prevent draft execution from counting as completed
ALTER TABLE exam_answers ADD COLUMN IF NOT EXISTS is_finalized BOOLEAN NOT NULL DEFAULT false;

-- Backfill existing submitted attempts where the coding answer was evaluated as passed
UPDATE exam_answers ea
SET is_finalized = true
FROM exam_attempts att
WHERE ea.attempt_id = att.id
  AND (
    ea.is_correct = true
    OR (ea.test_cases_passed IS NOT NULL AND ea.total_test_cases IS NOT NULL AND ea.test_cases_passed = ea.total_test_cases AND ea.total_test_cases > 0)
  );
