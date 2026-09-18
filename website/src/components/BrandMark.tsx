/** Vector artwork avoids iOS substituting a coloured emoji for the brand. */
export function BrandMark() {
  return (
    <svg width="1em" height="1em" viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">
      <path d="M16 2v28M2 16h28M6.1 6.1l19.8 19.8M6.1 25.9L25.9 6.1" stroke="currentColor" strokeWidth="2.4" />
    </svg>
  );
}
