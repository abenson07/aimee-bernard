// Icons from Stacki (https://github.com/flowtricks/stacki), MIT License, Copyright (c) 2026 Timothy Ricks.
// Only the ones the Site editor uses, copied as they are.
import type { CSSProperties, ReactNode } from "react";
export interface IconProps {
  readonly children?: ReactNode;
  readonly size?: number | undefined;
  readonly className?: string | undefined;
  readonly style?: CSSProperties | undefined;
  readonly filled?: boolean;
  readonly strokeWidth?: number;
}

// Minimal stroke-based icon set on a 16px grid, Framer-style.
const I = ({
  children,
  size = 16,
  className,
  style,
  filled = false,
  strokeWidth = 1.3,
}: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill={filled ? "currentColor" : "none"}
    stroke={filled ? "none" : "currentColor"}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ display: "block", flexShrink: 0, ...style }}
    aria-hidden="true"
  >
    {children}
  </svg>
);

const I24 = ({ children, size = 24, className, style }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    style={{ display: "block", flexShrink: 0, ...style }}
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const TextIcon = (p: IconProps) => (
  <I {...p}>
    <path d="M3.5 4.5V3.5h9v1M8 3.5v9M6.3 12.5h3.4" />
  </I>
);
export const ChevronLeftIcon = (p: IconProps) => (
  <I {...p}>
    <path d="m10 4-4 4 4 4" />
  </I>
);
export const ChevronRightIcon = (p: IconProps) => (
  <I {...p}>
    <path d="m6 4 4 4-4 4" />
  </I>
);
export const ChevronDownIcon = (p: IconProps) => (
  <I {...p}>
    <path d="m4 6 4 4 4-4" />
  </I>
);
export const RefreshIcon = (p: IconProps) => (
  <I {...p}>
    <path d="M13 8a5 5 0 1 1-1.47-3.54" />
    <path d="M13.2 2.6v2.6h-2.6" />
  </I>
);
export const CollectionIcon = (p: IconProps) => (
  <I filled {...p}>
    <path fillRule="evenodd" clipRule="evenodd" d={collectionIconPath1} />
  </I>
);
export const UploadCloudIcon = (p: IconProps) => (
  <I {...p}>
    <path d="M8 10.5V4M4.8 7.2 8 4l3.2 3.2" />
    <path d="M2.5 13h11" />
  </I>
);
export const ElementImageIcon = (p: IconProps) => (
  <I {...p} filled>
    <path d={elementImageIconPath1} />
    <path fillRule="evenodd" clipRule="evenodd" d={elementImageIconPath2} />
  </I>
);
export const ElementSectionIcon = (p: IconProps) => (
  <I {...p} filled>
    <path fillRule="evenodd" clipRule="evenodd" d={elementSectionIconPath1} />
  </I>
);
export const ElementLinkIcon = (p: IconProps) => (
  <I {...p} filled>
    <path fillRule="evenodd" clipRule="evenodd" d={elementLinkIconPath1} />
  </I>
);
export const ElementH2Icon = (p: IconProps) => (
  <I {...p} filled>
    <path d="M3 4V12H4V9H7V12H8V4H7V8H4V4H3Z" />
    <path d={elementH2IconPath1} />
  </I>
);
export const ElementPIcon = (p: IconProps) => (
  <I {...p} filled>
    <path fillRule="evenodd" clipRule="evenodd" d={elementPIconPath1} />
  </I>
);
export const ElementButtonIcon = (p: IconProps) => (
  <I {...p} filled>
    <path d={elementButtonIconPath1} />
  </I>
);
/* Not from Stacki: a plain "i" in a circle, in the same stroke style. */
export const InfoIcon = (p: IconProps) => (
  <I {...p}>
    <circle cx="8" cy="8" r="5.8" />
    <path d="M8 7.2v3.6M8 5.2v.1" />
  </I>
);
export const CheckIcon = (p: IconProps) => (
  <I {...p} strokeWidth={1.6}>
    <path d="m3.5 8.5 3 3 6-7" />
  </I>
);
export const ExternalIcon = (p: IconProps) => (
  <I {...p}>
    <path d="M12.5 9.5v3.5a.5.5 0 0 1-.5.5H3.5a.5.5 0 0 1-.5-.5V4.5a.5.5 0 0 1 .5-.5H7" />
    <path d="M9.5 2.5h4v4M13.2 2.8 7.8 8.2" />
  </I>
);
export const DesktopIcon = (p: IconProps) => (
  <I {...p}>
    <rect x="2" y="3" width="12" height="8.5" rx="1.2" />
    <path d="M6 14h4M8 11.5V14" />
  </I>
);
export const TabletIcon = (p: IconProps) => (
  <I {...p}>
    <rect x="3.5" y="2" width="9" height="12" rx="1.5" />
    <path d="M7 12h2" />
  </I>
);
export const PhoneIcon = (p: IconProps) => (
  <I {...p}>
    <rect x="4.5" y="1.75" width="7" height="12.5" rx="1.5" />
    <path d="M7 12.25h2" />
  </I>
);
export const AssetManagerIcon = (p: IconProps) => (
  <I24 {...p}>
    <path d={assetManagerIconPath1} fill="currentColor" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d={assetManagerIconPath2}
      fill="currentColor"
    />
    <g opacity="0.4">
      <path d={assetManagerIconPath3} fill="currentColor" />
      <path d={assetManagerIconPath4} fill="currentColor" />
      <path
        d="M12.5 18.9999H8L11.6464 15.3535C11.9614 15.0385 12.5 15.2616 12.5 15.707V18.9999Z"
        fill="currentColor"
      />
    </g>
  </I24>
);
export const CmsIcon = ({ size = 24, className, style }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    className={className}
    style={{ display: "block", flexShrink: 0, ...style }}
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d={cmsIconPath1}
      fill="currentColor"
    />
  </svg>
);
export const PagePanelIcon = (p: IconProps) => (
  <I24 {...p}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d={pagePanelIconPath1}
      fill="currentColor"
    />
    <path opacity="0.4" d={pagePanelIconPath2} fill="currentColor" />
  </I24>
);
export const NavigatorIcon = (p: IconProps) => (
  <I24 {...p}>
    <path d="M2 7H17V6H2V7Z" fill="currentColor" />
    <path d="M22 12H7V11H22V12Z" fill="currentColor" />
    <path d="M22 17H7V16H22V17Z" fill="currentColor" />
  </I24>
);
export const CloseIcon = (p: IconProps) => (
  <I {...p}>
    <path d="m4 4 8 8M12 4l-8 8" />
  </I>
);

const assetManagerIconPath1 =
  "M9 10C9.55228 10 10 9.55228 10 9C10 8.44772 9.55228 8 9 8C8.44772 8 8 8.447" +
  "72 8 9C8 9.55228 8.44772 10 9 10Z";
const assetManagerIconPath2 =
  "M5 6.5C5 5.67157 5.67157 5 6.5 5H18.5C19.3284 5 20 5.67157 20 6.5V18.5C20 1" +
  "9.3284 19.3284 20 18.5 20H6.5C5.67157 20 5 19.3284 5 18.5V6.5ZM6.5 6C6.2238" +
  "6 6 6 6.22386 6 6.5V18.2929L12.5 11.7929L19 18.2929V6.5C19 6.22386 18.7761 " +
  "6 18.5 6H6.5ZM12.5 13.2071L18.2929 19H6.70711L12.5 13.2071Z";
const assetManagerIconPath3 =
  "M9.79307 1.30827C10.1836 0.91775 10.8168 0.91775 11.2073 1.30827L13.899 3.9" +
  "9994H7.1014L9.79307 1.30827Z";
const assetManagerIconPath4 =
  "M3.99993 7.10141V13.8999L1.30779 11.2078C0.917262 10.8172 0.917261 10.1841 " +
  "1.30779 9.79356L3.99993 7.10141Z";
const cmsIconPath1 =
  "M4.5752 2.79515C5.47691 2.2942 6.68875 2 8 2C9.31125 2 10.5231 2.2942 11.42" +
  "48 2.79515C12.3096 3.2867 13 4.04561 13 5V11C13 11.9544 12.3096 12.7133 11." +
  "4248 13.2048C10.5231 13.7058 9.31125 14 8 14C6.68875 14 5.47691 13.7058 4.5" +
  "752 13.2048C3.69042 12.7133 3 11.9544 3 11V5C3 4.04561 3.69042 3.2867 4.575" +
  "2 2.79515ZM4 9.82287V11C4 11.4263 4.31694 11.9174 5.06084 12.3307C5.7878 12" +
  ".7346 6.82597 13 8 13C9.17403 13 10.2122 12.7346 10.9392 12.3307C11.6831 11" +
  ".9174 12 11.4263 12 11V9.82287C11.8227 9.96383 11.6289 10.0915 11.4248 10.2" +
  "048C10.5231 10.7058 9.31125 11 8 11C6.68875 11 5.47691 10.7058 4.5752 10.20" +
  "48C4.37109 10.0915 4.17733 9.96383 4 9.82287ZM12 8C12 8.42632 11.6831 8.917" +
  "41 10.9392 9.33069C10.2122 9.73456 9.17403 10 8 10C6.82597 10 5.7878 9.7345" +
  "6 5.06084 9.33069C4.31694 8.91741 4 8.42632 4 8V6.82287C4.17733 6.96383 4.3" +
  "7109 7.09145 4.5752 7.20485C5.47691 7.7058 6.68875 8 8 8C9.31125 8 10.5231 " +
  "7.7058 11.4248 7.20485C11.6289 7.09145 11.8227 6.96383 12 6.82287V8ZM10.939" +
  "2 3.66931C11.6831 4.08259 12 4.57368 12 5C12 5.42632 11.6831 5.91741 10.939" +
  "2 6.33069C10.2122 6.73456 9.17403 7 8 7C6.82597 7 5.7878 6.73456 5.06084 6." +
  "33069C4.31694 5.91741 4 5.42632 4 5C4 4.57368 4.31694 4.08259 5.06084 3.669" +
  "31C5.7878 3.26544 6.82597 3 8 3C9.17403 3 10.2122 3.26544 10.9392 3.66931Z";
const collectionIconPath1 =
  "M4.5752 2.79515C5.47691 2.2942 6.68875 2 8 2C9.31125 2 10.5231 2.2942 11.42" +
  "48 2.79515C12.3096 3.2867 13 4.04561 13 5V11C13 11.9544 12.3096 12.7133 11." +
  "4248 13.2048C10.5231 13.7058 9.31125 14 8 14C6.68875 14 5.47691 13.7058 4.5" +
  "752 13.2048C3.69042 12.7133 3 11.9544 3 11V5C3 4.04561 3.69042 3.2867 4.575" +
  "2 2.79515ZM4 9.82287V11C4 11.4263 4.31694 11.9174 5.06084 12.3307C5.7878 12" +
  ".7346 6.82597 13 8 13C9.17403 13 10.2122 12.7346 10.9392 12.3307C11.6831 11" +
  ".9174 12 11.4263 12 11V9.82287C11.8227 9.96383 11.6289 10.0915 11.4248 10.2" +
  "048C10.5231 10.7058 9.31125 11 8 11C6.68875 11 5.47691 10.7058 4.5752 10.20" +
  "48C4.37109 10.0915 4.17733 9.96383 4 9.82287ZM12 8C12 8.42632 11.6831 8.917" +
  "41 10.9392 9.33069C10.2122 9.73456 9.17403 10 8 10C6.82597 10 5.7878 9.7345" +
  "6 5.06084 9.33069C4.31694 8.91741 4 8.42632 4 8V6.82287C4.17733 6.96383 4.3" +
  "7109 7.09145 4.5752 7.20485C5.47691 7.7058 6.68875 8 8 8C9.31125 8 10.5231 " +
  "7.7058 11.4248 7.20485C11.6289 7.09145 11.8227 6.96383 12 6.82287V8ZM10.939" +
  "2 3.66931C11.6831 4.08259 12 4.57368 12 5C12 5.42632 11.6831 5.91741 10.939" +
  "2 6.33069C10.2122 6.73456 9.17403 7 8 7C6.82597 7 5.7878 6.73456 5.06084 6." +
  "33069C4.31694 5.91741 4 5.42632 4 5C4 4.57368 4.31694 4.08259 5.06084 3.669" +
  "31C5.7878 3.26544 6.82597 3 8 3C9.17403 3 10.2122 3.26544 10.9392 3.66931Z";
const elementButtonIconPath1 =
  "M6 3H7.5V7.00001L11 7C11.5523 7 12 7.44771 12 8V10.5858C12 10.851 11.8946 1" +
  "1.1054 11.7071 11.2929L10.2929 12.7071C10.1054 12.8946 9.851 13 9.58579 13L" +
  "6.1894 13.0001L2.96973 9.78039L4.03039 8.71973L6 10.6893V3Z";
const elementH2IconPath1 =
  "M10 7V5.5C10 4.67157 10.6716 4 11.5 4H12.5C13.328 4 13.9993 4.67092 14 5.49" +
  "879V7.12546C13.9997 7.48837 13.8679 7.83888 13.6289 8.11202L11.1019 11H14V1" +
  "2H10V10.7407L12.8763 7.45352C12.956 7.36237 13 7.24538 13 7.12426V5.5C13 5." +
  "22386 12.7761 5 12.5 5H11.5C11.2239 5 11 5.22386 11 5.5V7H10Z";
const elementImageIconPath1 =
  "M6 7C6.55228 7 7 6.55228 7 6C7 5.44772 6.55228 5 6 5C5.44772 5 5 5.44772 5 " +
  "6C5 6.55228 5.44772 7 6 7Z";
const elementImageIconPath2 =
  "M2 3C2 2.44772 2.44772 2 3 2H13C13.5523 2 14 2.44772 14 3V13C14 13.5523 13." +
  "5523 14 13 14H3C2.44772 14 2 13.5523 2 13V3ZM13 3L3 3V12.2929L8 7.29289L13 " +
  "12.2929V3ZM8 8.70711L12.2929 13H3.70711L8 8.70711Z";
const elementLinkIconPath1 =
  "M8.64643 3.64667C9.67012 2.62298 11.3298 2.62298 12.3535 3.64667C13.3772 4." +
  "67036 13.3772 6.33009 12.3535 7.35378L11.3535 8.35378L10.6464 7.64667L11.64" +
  "64 6.64667C12.2796 6.01351 12.2796 4.98695 11.6464 4.35378C11.0133 3.72062 " +
  "9.9867 3.72061 9.35354 4.35378L8.35354 5.35378L7.64643 4.64667L8.64643 3.64" +
  "667ZM6.35354 7.35378L5.35354 8.35378C4.72037 8.98695 4.72037 10.0135 5.3535" +
  "4 10.6467C5.9867 11.2798 7.01326 11.2798 7.64643 10.6467L8.64643 9.64667L9." +
  "35354 10.3538L8.35353 11.3538C7.32984 12.3775 5.67012 12.3775 4.64643 11.35" +
  "38C3.62274 10.3301 3.62274 8.67036 4.64643 7.64667L5.64643 6.64667L6.35354 " +
  "7.35378ZM7.35354 9.35378L10.3535 6.35378L9.64643 5.64667L6.64643 8.64667L7." +
  "35354 9.35378Z";
const elementPIconPath1 =
  "M5 4H9C10.1046 4 11 4.89543 11 6V7C11 8.10457 10.1046 9 9 9H6V12H5V4ZM6 8H9" +
  "C9.55228 8 10 7.55228 10 7V6C10 5.44772 9.55228 5 9 5H6V8Z";
const elementSectionIconPath1 =
  "M2 13C2 13.5523 2.44772 14 3 14L13 14C13.5523 14 14 13.5523 14 13L14 3C14 2" +
  ".44771 13.5523 2 13 2L3 2C2.44771 2 2 2.44772 2 3L2 13ZM3 4L3 3L13 3L13 4L3" +
  " 4ZM3 5L3 11L13 11L13 5L3 5ZM13 12L3 12L3 13L13 13L13 12Z";
const pagePanelIconPath1 =
  "M6.5 4C6.22386 4 6 4.22386 6 4.5V19.5C6 19.7761 6.22386 20 6.5 20H18.5C18.7" +
  "761 20 19 19.7761 19 19.5V9.70711L13.2929 4H6.5ZM5 4.5C5 3.67157 5.67157 3 " +
  "6.5 3H13.7071L20 9.29289V19.5C20 20.3284 19.3284 21 18.5 21H6.5C5.67157 21 " +
  "5 20.3284 5 19.5V4.5Z";
const pagePanelIconPath2 =
  "M16.7929 10H13.5C13.2239 10 13 9.77614 13 9.5V6.20711C13 5.76165 13.5386 5." +
  "53857 13.8536 5.85355L17.1464 9.14645C17.4614 9.46143 17.2383 10 16.7929 10" +
  "Z";

export const PlusIcon = (p: IconProps) => (
  <I {...p}>
    <path d="M8 3v10M3 8h10" />
  </I>
);

export const BugIcon = (p: IconProps) => (
  <I {...p}>
    <path d="M5.5 4.5a2.5 2.5 0 0 1 5 0M5 6h6v3.5a3 3 0 0 1-6 0zM8 6v6.5M5 8H2.5M11 8h2.5M5.2 11 3 12.5M10.8 11l2.2 1.5M5.2 5 3.5 3.5M10.8 5l1.7-1.5" />
  </I>
);
