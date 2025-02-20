# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Refactored
- Separated settings functionality from `Header` component
- Created new `UserSettings` component to manage user settings
- Improved code modularity and separation of concerns in dashboard header

### Changed
- Moved settings dialog and related logic to a dedicated `UserSettings.tsx` file
- Simplified `Header.tsx` by removing settings-specific code and imports
- Decoupled settings rendering from header component logic
- Replaced minimal settings placeholder with a structured, multi-section settings dialog
- Replaced notification management buttons with Switch components
- Enhanced theme selection experience in user dropdown menu
- Improved visual hierarchy and user experience in settings interface
- Refactored Header component to support more comprehensive settings management
- Removed duplicate theme toggle from dropdown menu
- Updated theme toggle buttons to use custom green and green outline variants
- Implemented dynamic button styling based on current theme state
- Updated button variants to use custom green and green outline styles for active and hover states
- Updated Switch component to use green color (#008033) for checked state
- Replaced placeholder switches with stateful switches
- Enhanced notification settings with interactive toggles
- Updated Danger Zone section with green-themed destructive button
- Replaced red-themed delete account button with green variant
- Enhanced visual consistency in settings dialog
- Updated Danger Zone section with green-themed background and border
- Styled Danger Zone header with green color
- Replaced red-themed styling with green color scheme
- Enhanced visual consistency in settings dialog
- Updated `Header.tsx` to integrate Profile dialog functionality
- Added Profile menu item with User icon in dropdown menu
- Implemented state management for Profile dialog in Header component
- Simplified `ProfileDialog.tsx` to focus on name and avatar editing
- Removed email field from profile dialog
- Updated dialog description to be more concise
- Implemented edit-on-click interaction for name field in Profile Dialog
- Added pen and check icons to toggle name editing mode
- Improved name editing UX with inline editing and toggle button
- Modified name input to be disabled by default, maintaining layout consistency
- Implemented dynamic input value and disabled state for name editing
- Refined name editing interaction to use a single input component
- Upgraded user role management from string-based to type-safe enum
- Introduced granular user roles: USER, ADMIN, and MODERATOR
- Enhanced Prisma schema to support more comprehensive user management
- Replaced Prisma enum with string-based role to ensure MSSQL compatibility
- Added database-level check constraint to validate user roles
- Maintained role-based access control using string literals: 'USER', 'ADMIN', 'MODERATOR'
- Removed database-level role constraint due to MSSQL limitations
- Implemented application-level role validation
- Ensured type safety and consistent role management
- Migrated role validation from client-side utility to server actions
- Improved security by performing role checks on the server
- Updated NextAuth configuration to support user roles
- Extended session and token interfaces to include role information

### Added
- Comprehensive settings frontend in Header component
  - Expanded theme selection with dedicated light/dark mode buttons
  - Appearance settings section with visual theme toggle
  - Notification settings section with Switch components for email and push notifications
  - Account information section displaying current email and password management options
  - Two-Factor Authentication toggle in Account settings
  - Danger zone section with account deletion option
  - Increased dialog width to `sm:max-w-[600px]` for better content layout
  - Grid-based layout for improved settings organization
  - Added `Switch` component for notification toggles
  - Imported `Switch` from UI component library
- State management for notification switches
- Added unique identifiers for notification switches
- Implemented checked state tracking for notification toggles
- Green-themed background for Danger Zone section
- Subtle border and rounded corners for Danger Zone container
- Enhanced visual separation of critical account actions
- Changed Danger Zone background color to a darker shade of gray for better contrast
- Added a subtle border around the Danger Zone section to improve visual separation
- Created new `ProfileDialog.tsx` component for user profile management
- Added avatar upload and preview functionality in profile dialog
- Implemented profile dialog with name and email editing capabilities
- Implemented robust role-based access control with `UserRole` enum
- Added admin-specific user tracking fields:
  - `isActive` to enable/disable user accounts
  - `lastLogin` to track user access times
  - `loginAttempts` to monitor and prevent brute-force attacks
- Created `roleValidation.ts` utility for robust role management
  - Defined type-safe `UserRole` with allowed roles
  - Implemented role validation functions
  - Added runtime checks for user roles
- Created `roleActions.ts` server actions for role management
  - Implemented server-side role validation
  - Added utility functions for role checking:
    - `isAdmin()`
    - `isAdminOrModerator()`
  - Moved role validation to server-side for enhanced security
- Comprehensive admin dashboard for user management
  - Secure, role-based admin page at `/admin`
  - User listing with detailed account information
    - Displays user ID, name, email, role, status, last login, and login attempts
  - Dynamic role management with dropdown selection
  - User activation/deactivation toggle functionality
  - User deletion with confirmation dialog
  - Server-side role and permission validation
  - Enhanced user tracking with login attempts and last login timestamp
- Prisma schema updates to support advanced user management
  - Added `isActive` field to enable/disable user accounts
  - Added `lastLogin` to track user access times
  - Added `loginAttempts` to monitor and prevent brute-force attacks
- Server actions for secure user management operations
  - `getAllUsers()`: Retrieve paginated user list with admin access
  - `updateUserRole()`: Modify user roles securely
  - `toggleUserActivation()`: Enable/disable user accounts
  - `deleteUser()`: Remove user accounts with admin confirmation
- Role-based access control for admin dashboard
  - Strict server-side role checking
  - Fallback to access denied page for unauthorized users
- Enhanced admin dashboard user management features
  - Client-side pagination with dynamic page controls
    - Configurable users per page
    - Previous/Next page navigation
    - Total page count display
  - Real-time user search functionality
    - Search across name, email, and role fields
    - Instant filtering of user list
  - Improved loading state management
    - Animated loading spinner during data fetch
    - Smooth transition between loading and content states
  - Empty state handling for user list
    - Informative message when no users match search criteria
- Performance optimizations in user management interface
  - Implemented memoization for search and pagination
  - Reduced unnecessary re-renders
  - Efficient client-side data processing
- Advanced user management filtering and sorting
  - Comprehensive column-based sorting
    - Sortable columns: Name, Email, Role, Status, Last Login, Login Attempts
    - Toggle between ascending and descending order
    - Visual sorting indicators with ArrowUpDown icon
  - Enhanced search capabilities
    - General search across multiple fields
    - Dedicated email filter with clear functionality
  - Intelligent sorting algorithm
    - Handles different data types (strings, dates, booleans)
    - Robust null and undefined value handling
  - Persistent sorting state across pagination
- Advanced search column selection
  - Toggleable search columns with visual indicators
  - Dynamic search across multiple user attributes
    - Name
    - Email
    - Role
    - Login Attempts
  - Intuitive column selection with single-character buttons
  - Flexible search scope configuration
- Enhanced sorting visualization
  - Active sorting column highlighted with green background
  - Directional sorting indicators with color and rotation
  - Immediate visual feedback on sorting state
- Enhanced search interface with column selection dropdown
  - Intuitive dropdown to select search column
  - Dynamic placeholder based on selected column
  - Improved search experience with clear column targeting
  - Readable column names in dropdown
- Refined search input design
  - Search icon for visual clarity
  - Seamless integration with column selection
- Enhanced column sorting interaction
  - Two-step column sorting mechanism
    - First click: Sort in ascending order
    - Second click: Sort in descending order
    - Third click: Reset sorting to default state
  - Intelligent sorting reset functionality
  - Seamless sorting state management

### Improved
- User interface for settings dialog
- Notification settings interaction
- Theme selection experience
- Color scheme and styling of critical account actions
- Visual hierarchy in settings Danger Zone section
- Overall visual cohesion of the Danger Zone section
- Color scheme and styling of critical account actions
- Visual hierarchy in settings Danger Zone section
- Overall design cohesion of settings interface
- Enhanced security for admin-level operations
- Granular user management capabilities
- User tracking and monitoring features
- Error handling and user feedback with toast notifications
- Separation of concerns between client and server components
- User management interface responsiveness
- Search and filtering user experience
- Data loading and state management
- Visual feedback during asynchronous operations
- User management search experience
- Data exploration and analysis capabilities
- Flexibility in user list navigation
- Visual feedback during sorting operations
- Search flexibility and user control
- Visual hierarchy in user management interface
- User interaction with search and sorting mechanisms
- User search interaction
- Search input usability
- Visual design of search components
- User interaction with table sorting
- Sorting state transitions
- Flexibility in data exploration

### Technical Improvements
- Added semantic structure to settings dialog
- Implemented responsive design for settings section
- Prepared infrastructure for future notification state management
- Implemented local state management for notification preferences
- Added accessibility attributes to switches

### Planned
- Implement actual functionality for notification management
- Add state management for notification switches
- Develop full workflow for account email and password changes
- Create backend endpoints for account management features
- Implement full Two-Factor Authentication (2FA) toggle functionality
- Develop admin dashboard for user account management
- Implement role-based access control (RBAC) middleware
- Create admin-specific API endpoints for user management

## [0.1.0] - 2025-02-17

### Added
- Initial project setup
- Basic dashboard structure
- Authentication system
- Theme support

## [0.0.1] - Initial Commit

### Added
- Project initialization
- Basic project structure
