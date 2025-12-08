/**
 * Lucide Icon Mocks
 * Simple mock implementations for Lucide React icons
 */

import React from 'react';

export interface IconProps extends React.SVGAttributes<SVGElement> {
  size?: number | string;
  strokeWidth?: number | string;
  absoluteStrokeWidth?: boolean;
  color?: string;
}

/**
 * Create a mock icon component
 */
const createMockIcon = (name: string) => {
  return React.forwardRef<SVGSVGElement, IconProps>(
    ({ size = 24, strokeWidth = 2, color, className, ...props }, ref) => {
      return React.createElement('span', {
        ref,
        'data-lucide-icon': name,
        'data-size': size,
        'data-stroke-width': strokeWidth,
        'data-color': color,
        className,
        role: 'img',
        'aria-label': name,
        ...props,
      });
    }
  );
};

// Export all commonly used Lucide icons
export const Menu = createMockIcon('Menu');
export const X = createMockIcon('X');
export const ChevronLeft = createMockIcon('ChevronLeft');
export const ChevronRight = createMockIcon('ChevronRight');
export const ChevronDown = createMockIcon('ChevronDown');
export const ChevronUp = createMockIcon('ChevronUp');
export const Search = createMockIcon('Search');
export const Settings = createMockIcon('Settings');
export const User = createMockIcon('User');
export const Home = createMockIcon('Home');
export const FileText = createMockIcon('FileText');
export const File = createMockIcon('File');
export const Folder = createMockIcon('Folder');
export const FolderOpen = createMockIcon('FolderOpen');
export const Plus = createMockIcon('Plus');
export const Minus = createMockIcon('Minus');
export const Edit = createMockIcon('Edit');
export const Trash = createMockIcon('Trash');
export const Save = createMockIcon('Save');
export const Download = createMockIcon('Download');
export const Upload = createMockIcon('Upload');
export const Send = createMockIcon('Send');
export const MessageSquare = createMockIcon('MessageSquare');
export const Bell = createMockIcon('Bell');
export const Check = createMockIcon('Check');
export const AlertCircle = createMockIcon('AlertCircle');
export const Info = createMockIcon('Info');
export const HelpCircle = createMockIcon('HelpCircle');
export const Eye = createMockIcon('Eye');
export const EyeOff = createMockIcon('EyeOff');
export const Lock = createMockIcon('Lock');
export const Unlock = createMockIcon('Unlock');
export const Copy = createMockIcon('Copy');
export const ExternalLink = createMockIcon('ExternalLink');
export const Link = createMockIcon('Link');
export const Share = createMockIcon('Share');
export const Star = createMockIcon('Star');
export const Heart = createMockIcon('Heart');
export const ThumbsUp = createMockIcon('ThumbsUp');
export const ThumbsDown = createMockIcon('ThumbsDown');
export const Play = createMockIcon('Play');
export const Pause = createMockIcon('Pause');
export const Stop = createMockIcon('Stop');
export const SkipForward = createMockIcon('SkipForward');
export const SkipBack = createMockIcon('SkipBack');
export const Volume = createMockIcon('Volume');
export const Volume2 = createMockIcon('Volume2');
export const VolumeX = createMockIcon('VolumeX');
export const Mic = createMockIcon('Mic');
export const MicOff = createMockIcon('MicOff');
export const Video = createMockIcon('Video');
export const VideoOff = createMockIcon('VideoOff');
export const Camera = createMockIcon('Camera');
export const Image = createMockIcon('Image');
export const Music = createMockIcon('Music');
export const Calendar = createMockIcon('Calendar');
export const Clock = createMockIcon('Clock');
export const MapPin = createMockIcon('MapPin');
export const Navigation = createMockIcon('Navigation');
export const Compass = createMockIcon('Compass');
export const Mail = createMockIcon('Mail');
export const Phone = createMockIcon('Phone');
export const Printer = createMockIcon('Printer');
export const Wifi = createMockIcon('Wifi');
export const WifiOff = createMockIcon('WifiOff');
export const Bluetooth = createMockIcon('Bluetooth');
export const Battery = createMockIcon('Battery');
export const BatteryCharging = createMockIcon('BatteryCharging');
export const Zap = createMockIcon('Zap');
export const Sun = createMockIcon('Sun');
export const Moon = createMockIcon('Moon');
export const Cloud = createMockIcon('Cloud');
export const CloudOff = createMockIcon('CloudOff');
export const Umbrella = createMockIcon('Umbrella');
export const Package = createMockIcon('Package');
export const Archive = createMockIcon('Archive');
export const Inbox = createMockIcon('Inbox');
export const Layers = createMockIcon('Layers');
export const Grid = createMockIcon('Grid');
export const List = createMockIcon('List');
export const MoreVertical = createMockIcon('MoreVertical');
export const MoreHorizontal = createMockIcon('MoreHorizontal');
export const Filter = createMockIcon('Filter');
export const RefreshCw = createMockIcon('RefreshCw');
export const Loader = createMockIcon('Loader');
export const TrendingUp = createMockIcon('TrendingUp');
export const TrendingDown = createMockIcon('TrendingDown');
export const BarChart = createMockIcon('BarChart');
export const PieChart = createMockIcon('PieChart');
export const Activity = createMockIcon('Activity');
export const Code = createMockIcon('Code');
export const Terminal = createMockIcon('Terminal');
export const GitBranch = createMockIcon('GitBranch');
export const GitCommit = createMockIcon('GitCommit');
export const GitMerge = createMockIcon('GitMerge');
export const GitPullRequest = createMockIcon('GitPullRequest');
export const Github = createMockIcon('Github');
export const Gitlab = createMockIcon('Gitlab');
export const Command = createMockIcon('Command');
export const Hash = createMockIcon('Hash');
export const AtSign = createMockIcon('AtSign');
export const DollarSign = createMockIcon('DollarSign');
export const Percent = createMockIcon('Percent');
export const Maximize = createMockIcon('Maximize');
export const Minimize = createMockIcon('Minimize');
export const Expand = createMockIcon('Expand');
export const Shrink = createMockIcon('Shrink');
export const Move = createMockIcon('Move');
export const RotateCw = createMockIcon('RotateCw');
export const RotateCcw = createMockIcon('RotateCcw');
export const Repeat = createMockIcon('Repeat');
export const Shuffle = createMockIcon('Shuffle');
export const Layout = createMockIcon('Layout');
export const Sidebar = createMockIcon('Sidebar');
export const Monitor = createMockIcon('Monitor');
export const Smartphone = createMockIcon('Smartphone');
export const Tablet = createMockIcon('Tablet');
export const Watch = createMockIcon('Watch');
export const Cpu = createMockIcon('Cpu');
export const HardDrive = createMockIcon('HardDrive');
export const Database = createMockIcon('Database');
export const Server = createMockIcon('Server');
export const Globe = createMockIcon('Globe');
export const Award = createMockIcon('Award');
export const Target = createMockIcon('Target');
export const Flag = createMockIcon('Flag');
export const Bookmark = createMockIcon('Bookmark');
export const Tag = createMockIcon('Tag');
export const Shield = createMockIcon('Shield');
export const ShieldOff = createMockIcon('ShieldOff');
export const Key = createMockIcon('Key');
export const LogIn = createMockIcon('LogIn');
export const LogOut = createMockIcon('LogOut');
export const UserPlus = createMockIcon('UserPlus');
export const UserMinus = createMockIcon('UserMinus');
export const Users = createMockIcon('Users');

/**
 * Export Icon type for type safety
 */
export type Icon = React.ForwardRefExoticComponent<
  IconProps & React.RefAttributes<SVGSVGElement>
>;

/**
 * Reset all icon mocks (for cleanup)
 */
export const resetIconMocks = () => {
  // No-op for now, icons are stateless
};
