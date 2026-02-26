import React from "react";

interface Props extends React.SVGProps<SVGSVGElement> {
  alt?: string;
  pathClassName?: string;
}

/** Сердечко (love) outline из icons-redesign. */
export const FavoritesIcon: React.FC<Props> = ({ className, pathClassName, ...props }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M17 6.50005C18.1045 6.50005 19 7.39548 19 8.50005M12 5.70259L12.6851 5.00005C14.816 2.81476 18.2709 2.81476 20.4018 5.00005C22.4755 7.12665 22.5392 10.5538 20.5461 12.76L14.8197 19.0982C13.2984 20.782 10.7015 20.782 9.18026 19.0982L3.45393 12.76C1.46078 10.5539 1.5245 7.12667 3.5982 5.00007C5.72912 2.81477 9.18404 2.81478 11.315 5.00007L12 5.70259Z"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={pathClassName}
      />
    </svg>
  );
};
