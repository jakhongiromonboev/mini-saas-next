import type { SVGProps } from 'react';

const paths = {
  folder:
    'M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z',
  activity: 'M3 12h4l3-8 4 16 3-8h4',
  wallet:
    'M20 8V6a2 2 0 0 0-2-2H6a3 3 0 0 0 0 6h14v10H6a3 3 0 0 1-3-3V7 M20 13h-5v4h5',
  calendar:
    'M8 3v4 M16 3v4 M3 10h18 M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z',
  search: 'M21 21l-5-5 M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  chevron: 'm6 9 6 6 6-6',
  plus: 'M12 5v14 M5 12h14',
  logout: 'M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4 M9 12h12 m-4-4 4 4-4 4',
};

export type WorkspaceIconName = keyof typeof paths;

interface WorkspaceIconProps extends SVGProps<SVGSVGElement> {
  name: WorkspaceIconName;
}

export default function WorkspaceIcon({ name, ...props }: WorkspaceIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name]} />
    </svg>
  );
}
