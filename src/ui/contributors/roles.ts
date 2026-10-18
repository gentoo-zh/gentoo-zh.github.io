// The role filter's contract between the live island and its startup script, which must not import React.

/** Marks each role toggle with its category; the toggle for every role carries ''. */
export const ROLE_ATTRIBUTE = 'data-gz-role';

/**
 * Fired on the island's container with a category as `detail`, it presses that role's toggle wherever
 * the overflow list put it, as a press held before mounting does when its toggle was folded away.
 */
export const ROLE_EVENT = 'gz-contributors-role';
