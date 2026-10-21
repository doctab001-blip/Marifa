/**
 * 3D-style icon set.
 *
 * Every export mirrors a lucide-react icon of the same name, so call sites only change their import path.
 * Each glyph is drawn with a thicker, gradient-lit stroke and stacked drop-shadows that read as a
 * bevelled, extruded edge (see `.i3d` in app/glass.css). Mount <Icon3DDefs /> once near the document
 * root so the shared gradients exist.
 */
import type { ReactElement } from "react";
import * as Lucide from "lucide-react";
import type { LucideProps } from "lucide-react";

export type Icon3DTone = "aqua" | "sky" | "violet" | "rose" | "amber" | "emerald" | "slate";
export type Icon3DProps = LucideProps & { tone?: Icon3DTone };
export type LucideIcon = ((props: Icon3DProps) => ReactElement) & { displayName?: string };

const GRADIENTS: Record<Icon3DTone, [string, string, string]> = {
  aqua: ["#c4f7ff", "#34d6e8", "#0d86a8"],
  sky: ["#dcf0ff", "#62baff", "#2b6fd8"],
  violet: ["#ece4ff", "#a78bfa", "#6a40d6"],
  rose: ["#ffd9df", "#fb7185", "#cf2d55"],
  amber: ["#fff3c4", "#fbbf24", "#d6800c"],
  emerald: ["#d2ffea", "#34d399", "#0d9466"],
  slate: ["#f4f7ff", "#b9c5de", "#7787aa"],
};

/** Shared gradient + bevel-lighting definitions. Rendered once; icons reference them by id. */
export function Icon3DDefs() {
  return (
    <svg aria-hidden="true" focusable="false" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
      <defs>
        {(Object.keys(GRADIENTS) as Icon3DTone[]).map((tone) => (
          <linearGradient key={tone} id={`i3d-${tone}`} gradientUnits="userSpaceOnUse" x1="3" y1="1" x2="21" y2="23">
            {/* Stop colours come from CSS variables so the same icon is lighter on dark and deeper on light. */}
            <stop offset="0" style={{ stopColor: `var(--i3d-${tone}-0, ${GRADIENTS[tone][0]})` }} />
            <stop offset="0.5" style={{ stopColor: `var(--i3d-${tone}-1, ${GRADIENTS[tone][1]})` }} />
            <stop offset="1" style={{ stopColor: `var(--i3d-${tone}-2, ${GRADIENTS[tone][2]})` }} />
          </linearGradient>
        ))}
        {/* Glyph colour when an icon sits on a coloured glossy tile. */}
        <linearGradient id="i3d-white" gradientUnits="userSpaceOnUse" x1="3" y1="1" x2="21" y2="23">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.6" stopColor="#f1f8ff" />
          <stop offset="1" stopColor="#c9dcf2" />
        </linearGradient>
        {/* Soft specular bevel: lights the rounded strokes from the top-left so glyphs read as moulded, not drawn. */}
        <filter id="i3d-bevel" x="-25%" y="-25%" width="150%" height="150%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation="0.55" result="blur" />
          <feSpecularLighting in="blur" surfaceScale="3.2" specularConstant="1" specularExponent="26" lightingColor="#ffffff" result="spec">
            <feDistantLight azimuth="225" elevation="52" />
          </feSpecularLighting>
          <feComposite in="spec" in2="SourceAlpha" operator="in" result="specIn" />
          <feComposite in="SourceGraphic" in2="specIn" operator="arithmetic" k1="0" k2="1" k3="0.9" k4="0" />
        </filter>
      </defs>
    </svg>
  );
}

function make(Base: Lucide.LucideIcon, defaultTone: Icon3DTone, name: string): LucideIcon {
  const Icon3D: LucideIcon = (props) => {
    const { tone = defaultTone, className, strokeWidth, ...rest } = props;
    void strokeWidth; // one weight for every 3D glyph keeps the set consistent
    return <Base {...rest} strokeWidth={2.2} stroke={`url(#i3d-${tone})`} className={`i3d i3d-${tone}${className ? ` ${className}` : ""}`} />;
  };
  Icon3D.displayName = name;
  return Icon3D;
}

export const Activity = make(Lucide.Activity, "aqua", "Activity");
export const ArrowLeft = make(Lucide.ArrowLeft, "slate", "ArrowLeft");
export const ArrowRight = make(Lucide.ArrowRight, "slate", "ArrowRight");
export const ArrowUpRight = make(Lucide.ArrowUpRight, "slate", "ArrowUpRight");
export const Award = make(Lucide.Award, "amber", "Award");
export const Baby = make(Lucide.Baby, "sky", "Baby");
export const BedDouble = make(Lucide.BedDouble, "violet", "BedDouble");
export const Bell = make(Lucide.Bell, "amber", "Bell");
export const BellRing = make(Lucide.BellRing, "amber", "BellRing");
export const BookOpen = make(Lucide.BookOpen, "violet", "BookOpen");
export const BookOpenCheck = make(Lucide.BookOpenCheck, "violet", "BookOpenCheck");
export const Bookmark = make(Lucide.Bookmark, "amber", "Bookmark");
export const Building2 = make(Lucide.Building2, "sky", "Building2");
export const Calculator = make(Lucide.Calculator, "violet", "Calculator");
export const CalendarCheck = make(Lucide.CalendarCheck, "sky", "CalendarCheck");
export const CalendarClock = make(Lucide.CalendarClock, "sky", "CalendarClock");
export const CalendarDays = make(Lucide.CalendarDays, "sky", "CalendarDays");
export const Check = make(Lucide.Check, "emerald", "Check");
export const CheckCircle2 = make(Lucide.CheckCircle2, "emerald", "CheckCircle2");
export const ChevronDown = make(Lucide.ChevronDown, "slate", "ChevronDown");
export const ChevronLeft = make(Lucide.ChevronLeft, "slate", "ChevronLeft");
export const ChevronRight = make(Lucide.ChevronRight, "slate", "ChevronRight");
export const CircleAlert = make(Lucide.CircleAlert, "rose", "CircleAlert");
export const ClipboardCheck = make(Lucide.ClipboardCheck, "emerald", "ClipboardCheck");
export const ClipboardList = make(Lucide.ClipboardList, "aqua", "ClipboardList");
export const Clock3 = make(Lucide.Clock3, "amber", "Clock3");
export const Droplets = make(Lucide.Droplets, "sky", "Droplets");
export const ExternalLink = make(Lucide.ExternalLink, "slate", "ExternalLink");
export const FileCheck2 = make(Lucide.FileCheck2, "emerald", "FileCheck2");
export const FileClock = make(Lucide.FileClock, "sky", "FileClock");
export const FilePenLine = make(Lucide.FilePenLine, "sky", "FilePenLine");
export const FileSearch = make(Lucide.FileSearch, "sky", "FileSearch");
export const FileText = make(Lucide.FileText, "sky", "FileText");
export const FileWarning = make(Lucide.FileWarning, "rose", "FileWarning");
export const GitBranch = make(Lucide.GitBranch, "violet", "GitBranch");
export const GraduationCap = make(Lucide.GraduationCap, "violet", "GraduationCap");
export const HeartHandshake = make(Lucide.HeartHandshake, "rose", "HeartHandshake");
export const HeartPulse = make(Lucide.HeartPulse, "rose", "HeartPulse");
export const History = make(Lucide.History, "amber", "History");
export const Hourglass = make(Lucide.Hourglass, "amber", "Hourglass");
export const House = make(Lucide.House, "sky", "House");
export const Info = make(Lucide.Info, "sky", "Info");
export const Landmark = make(Lucide.Landmark, "amber", "Landmark");
export const LayoutDashboard = make(Lucide.LayoutDashboard, "aqua", "LayoutDashboard");
export const LayoutGrid = make(Lucide.LayoutGrid, "aqua", "LayoutGrid");
export const Library = make(Lucide.Library, "violet", "Library");
export const List = make(Lucide.List, "aqua", "List");
export const ListChecks = make(Lucide.ListChecks, "aqua", "ListChecks");
export const Loader2 = make(Lucide.Loader2, "aqua", "Loader2");
export const LockKeyhole = make(Lucide.LockKeyhole, "amber", "LockKeyhole");
export const LogOut = make(Lucide.LogOut, "rose", "LogOut");
export const Megaphone = make(Lucide.Megaphone, "amber", "Megaphone");
export const Menu = make(Lucide.Menu, "slate", "Menu");
export const Palette = make(Lucide.Palette, "violet", "Palette");
export const PanelLeftClose = make(Lucide.PanelLeftClose, "slate", "PanelLeftClose");
export const PanelLeftOpen = make(Lucide.PanelLeftOpen, "slate", "PanelLeftOpen");
export const Pill = make(Lucide.Pill, "rose", "Pill");
export const Plus = make(Lucide.Plus, "emerald", "Plus");
export const Printer = make(Lucide.Printer, "slate", "Printer");
export const RotateCcw = make(Lucide.RotateCcw, "slate", "RotateCcw");
export const Save = make(Lucide.Save, "emerald", "Save");
export const Search = make(Lucide.Search, "aqua", "Search");
export const Send = make(Lucide.Send, "aqua", "Send");
export const Settings = make(Lucide.Settings, "slate", "Settings");
export const Settings2 = make(Lucide.Settings2, "slate", "Settings2");
export const ShieldAlert = make(Lucide.ShieldAlert, "rose", "ShieldAlert");
export const ShieldCheck = make(Lucide.ShieldCheck, "emerald", "ShieldCheck");
export const Siren = make(Lucide.Siren, "rose", "Siren");
export const Stethoscope = make(Lucide.Stethoscope, "aqua", "Stethoscope");
export const Trash2 = make(Lucide.Trash2, "rose", "Trash2");
export const TriangleAlert = make(Lucide.TriangleAlert, "rose", "TriangleAlert");
export const UserCheck = make(Lucide.UserCheck, "emerald", "UserCheck");
export const UserPlus = make(Lucide.UserPlus, "sky", "UserPlus");
export const UserRound = make(Lucide.UserRound, "sky", "UserRound");
export const UserRoundCheck = make(Lucide.UserRoundCheck, "emerald", "UserRoundCheck");
export const UsersRound = make(Lucide.UsersRound, "sky", "UsersRound");
export const WandSparkles = make(Lucide.WandSparkles, "violet", "WandSparkles");
export const X = make(Lucide.X, "slate", "X");
export const XCircle = make(Lucide.XCircle, "rose", "XCircle");
export const Moon = make(Lucide.Moon, "violet", "Moon");
export const Sun = make(Lucide.Sun, "amber", "Sun");
