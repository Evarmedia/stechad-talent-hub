---
version: alpha
name: STECHAD Talent Hub
description: Employment operations with burgundy actions, quiet white surfaces, and role-specific navigation.
colors:
  primary: "#8B0000"
  background: "#FFFFFF"
  foreground: "#1a1a1a"
  muted: "#F3F4F6"
  border: "#E5E7EB"
  danger: "#E53E3E"
typography:
  sans:
    fontFamily: "Inter, Roboto, sans-serif"
  display:
    fontFamily: "Montserrat, Inter, Roboto, sans-serif"
rounded:
  sm: "0.25rem"
  md: "0.5rem"
  lg: "0.75rem"
spacing:
  selection-panel: "1.5rem"
  selection-gap: "1.25rem"
components:
  button:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.background}"
    rounded: "{rounded.md}"
  organization-switcher:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
---

# STECHAD Talent Hub design

## Overview

The product is an employment operations workspace for staff, talent, project managers and HR administrators. The existing visual reference is an office directory: white work surfaces, legible labels, burgundy navigation and restrained borders. Organization names are the identifying content in the switch flow. Do not rebrand individual tenant dashboards.

The existing application uses English. The repository provides no separate locale or Japan-market contract. Desktop administration and narrow-screen employee access share the same controls and copy. Organization selection should remain quiet, recognizable and keyboard operable.

Runtime tokens remain canonical: `tailwind.config.ts` owns the palette, families, radii and smooth shadow; `src/index.css` owns the document font and scrollbar baseline. This file mirrors those values and does not generate CSS. Match each `colors` key to the equivalent Tailwind token (`danger` maps to `destructive`); match `typography.sans` to the document stack and `typography.display` to `font-montserrat`. Spacing entries describe the selection panel's `p-6` and `space-y-5` utilities.

## Colors

White backgrounds and dark foreground text carry information. Burgundy identifies actions and keyboard focus; muted gray supplies the selection-page surround. Borders separate surfaces without introducing another accent. Danger labels supplement failure text. Scrollbar thumb, hover and active tokens derive from existing muted text and burgundy; forced colors use system colors.

## Typography

Use the existing Inter/Roboto/sans-serif document stack for body copy, labels and controls. Montserrat remains available for existing brand display. Selection headings use `text-xl font-semibold`; guidance uses `text-sm`. Names wrap in selection buttons and remain fully available in the operating system's select popup.

## Layout

Retain the existing sidebar and 56px navbar. The organization selector occupies a bounded 128px column on narrow screens, 180px on small screens and 240px on desktop; its label remains visible. The selection panel uses a 28rem maximum width with 1rem outer padding and 1.5rem inner padding. Do not constrain existing feature panels or change their scroll owner.

## Elevation & Depth

Reuse `shadow-smooth` and a single border for the selection panel. The navbar retains its existing shadow. Selection needs no overlay or decorative media.

## Shapes

Reuse the shared small/medium/large radius family. Buttons and selects use the medium control radius; the selection panel uses the large radius.

## Components

`src/components/ui/button.tsx` owns actions; `src/components/OrganizationSwitcher.tsx` owns organization choices. Use shared Button variants for organization choices, refresh and sign out. Choices are outline buttons; recovery actions are ghost buttons. Native select intentionally delegates the popup appearance, placement and keyboard interaction to the operating system. Its trigger has a visible label, hover border, focus ring and disabled loading state.

During selection, remove the previous tenant subtree and show an app-owned status region. Successful selection mounts fresh data/chat providers with empty caches. Failure keeps organization choices and a text alert available. Empty membership state explains how to regain access. Organization management authority never implies an HR role or grants.

Keep existing Lucide iconography and shared toast owners. The switch flow uses persistent inline guidance rather than a toast. It adds no animation; reduced motion has no special switch transition to disable.

## Do's and Don'ts

- Do reuse the runtime tokens and role navigation helpers.
- Do show actual organization names and retain global sign out and invitation access.
- Don't retain a previous organization's data while loading another.
- Don't use a marketing hero, decorative tenant initials or new palette for this operational choice.

The separate internal administration entry reuses this office-directory vocabulary: burgundy identity/navigation, white bordered cards, native tables, wrapping labels, and a muted page surround. Its signature is an explicit “Internal administration” label and a permission-limited navigation strip; it adds no marketing illustration, alternate palette, customer sidebar or HR providers. Native status/role selects deliberately retain operating-system popup geometry and keyboard behavior. Lists own horizontal overflow; forms keep natural document scrolling. `ReasonDialog` composes the existing Radix alert-dialog and Button owners for audited security changes. `SecretField` owns masked platform setup keys/codes and reveal controls; provisioning material is held only in mounted component state.
