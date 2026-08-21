const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function UploadIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" strokeWidth="1.6" {...stroke}>
      <path d="M8 12.5V3.5" />
      <path d="M4 7.2 8 3.2l4 4" />
      <path d="M2.5 13.2h11" />
    </svg>
  );
}

export function PlusIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" strokeWidth="1.7" {...stroke}>
      <path d="M8 3.6v8.8" />
      <path d="M3.6 8h8.8" />
    </svg>
  );
}

export function ChevronRightIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" strokeWidth="1.6" {...stroke}>
      <path d="M6 3.5 10.5 8 6 12.5" />
    </svg>
  );
}

export function ChevronDownIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" strokeWidth="1.6" {...stroke}>
      <path d="M4 6.2 8 10.2l4-4" />
    </svg>
  );
}

export function SearchIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" strokeWidth="1.6" {...stroke}>
      <circle cx="7.2" cy="7.2" r="4.2" />
      <path d="m10.4 10.4 2.6 2.6" />
    </svg>
  );
}

export function FileIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" strokeWidth="1.5" {...stroke}>
      <path d="M9 1.8H4.4a1.2 1.2 0 0 0-1.2 1.2v10a1.2 1.2 0 0 0 1.2 1.2h7.2a1.2 1.2 0 0 0 1.2-1.2V5.6z" />
      <path d="M9 1.8v3.8h3.8" />
    </svg>
  );
}

export function LinkIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" strokeWidth="1.5" {...stroke}>
      <path d="M6.6 8.7a2.6 2.6 0 0 0 3.9.3l1.9-1.9a2.6 2.6 0 0 0-3.7-3.7l-1 1" />
      <path d="M9.4 7.3a2.6 2.6 0 0 0-3.9-.3L3.6 8.9a2.6 2.6 0 0 0 3.7 3.7l1-1" />
    </svg>
  );
}

export function TextIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" strokeWidth="1.5" {...stroke}>
      <path d="M3.4 3.4h9.2" />
      <path d="M3.4 6.6h9.2" />
      <path d="M3.4 9.8h6.4" />
      <path d="M3.4 13h4.2" />
    </svg>
  );
}

export function CloseIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" strokeWidth="1.6" {...stroke}>
      <path d="M4 4l8 8" />
      <path d="M12 4l-8 8" />
    </svg>
  );
}

export function CheckIcon({ size = 11, weight = "2.2" }: { size?: number; weight?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" strokeWidth={weight} {...stroke}>
      <path d="m3.6 8.4 2.9 2.9 5.9-6.6" />
    </svg>
  );
}

export function LockIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" strokeWidth="1.5" {...stroke}>
      <path d="M5.2 7.2V5.4a2.8 2.8 0 0 1 5.6 0v1.8" />
      <rect x="3.6" y="7.2" width="8.8" height="6.2" rx="1.4" />
    </svg>
  );
}

export function DropIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="1.4" {...stroke}>
      <path d="M12 16.5V6.8" />
      <path d="M7.8 11 12 6.8l4.2 4.2" />
      <path d="M4 17.5v1.2A1.3 1.3 0 0 0 5.3 20h13.4a1.3 1.3 0 0 0 1.3-1.3v-1.2" />
    </svg>
  );
}
