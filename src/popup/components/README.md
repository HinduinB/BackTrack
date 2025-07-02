# Components Organization

This directory contains all the UI components for the BackTrack popup, organized by type:

## 📁 Folder Structure

### `/shadcn/`
Contains shadcn/ui components
- `button.tsx` - Standard shadcn button component
- `index.ts` - Export file for shadcn components

### `/magicui/`
Contains Magic UI components with advanced animations and effects
- `BorderBeam.tsx` - Animated border beam effect component
- `index.ts` - Export file for Magic UI components

### `/ui/`
Contains custom app-specific UI components
- `Button.tsx` - Custom themed button component
- `CodeBlock.tsx` - Code display component
- `Dropdown.tsx` - Custom dropdown component
- `EmptyState.tsx` - Empty state display component
- `Icons.tsx` - Icon components
- `StatusBadge.tsx` - Status indicator badge
- `TabButton.tsx` - Tab navigation button
- `index.ts` - Export file for custom UI components

### Root Components
Main application components:
- `Header.tsx` - Popup header component
- `TabNavigation.tsx` - Main tab navigation
- `NetworkTab.tsx` - Network monitoring tab
- `NetworkRequestList.tsx` - Network request list view
- `NetworkRequestDetails.tsx` - Individual request details
- `ConsoleTab.tsx` - Console output tab
- `SettingsTab.tsx` - Settings configuration tab

## 🎯 Usage Guidelines

- **shadcn components**: Use for standard UI patterns, may need theme adaptation
- **Magic UI components**: Use for enhanced visual effects and animations
- **Custom UI components**: Use for app-specific functionality with existing theme system 