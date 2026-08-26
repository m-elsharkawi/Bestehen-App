export function Brand({ compact = false }: { readonly compact?: boolean }) {
  return (
    <span className="brand">
      <svg aria-hidden="true" className="brand-mark" viewBox="0 0 100 100">
        <g fill="none" stroke="currentColor" strokeWidth={compact ? 16 : 11}>
          <path d={compact ? "M28 22V78" : "M25 20V80"} />
          <path d={compact ? "M28 22H44a14 14 0 0 1 0 28H28" : "M25 20H44a15 15 0 0 1 0 30H25"} />
          <path d={compact ? "M28 50H46a14 14 0 0 1 0 28H28" : "M25 50H46a15 15 0 0 1 0 30H25"} />
        </g>
        <path
          className="brand-rule"
          d={compact ? "M12 50H88" : "M6 50H94"}
          fill="none"
          strokeWidth={compact ? 16 : 11}
        />
      </svg>
      <span className="brand-word">
        Bestehen <span aria-hidden="true">/</span> App
      </span>
    </span>
  );
}
