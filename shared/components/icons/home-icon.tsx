import React from "react";

interface Props extends React.SVGProps<SVGSVGElement> {
  alt?: string;
  pathClassName?: string;
}

export const HomeIcon: React.FC<Props> = ({
  width = 32,
  height = 32,
  className,
  pathClassName,
  ...props
}) => {
  return (
    <svg
      {...props}
      width={width}
      height={height}
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className={pathClassName}
        d="M6.66602 17.0127C6.66602 15.2024 6.66602 14.2972 7.03196 13.5016C7.39791 12.7059 8.08517 12.1168 9.45968 10.9387L10.793 9.79582C13.2774 7.66632 14.5197 6.60156 15.9993 6.60156C17.479 6.60156 18.7213 7.66632 21.2057 9.79582L22.539 10.9387C23.9135 12.1168 24.6008 12.7059 24.9667 13.5016C25.3327 14.2972 25.3327 15.2024 25.3327 17.0127V22.6666C25.3327 25.1807 25.3327 26.4378 24.5516 27.2189C23.7706 27.9999 22.5135 27.9999 19.9993 27.9999H11.9993C9.48519 27.9999 8.22811 27.9999 7.44706 27.2189C6.66602 26.4378 6.66602 25.1807 6.66602 22.6666V17.0127Z"
        stroke="#EB6081"
      />
      <path
        className={pathClassName}
        d="M19.3327 28V21C19.3327 20.4477 18.885 20 18.3327 20H13.666C13.1137 20 12.666 20.4477 12.666 21V28"
        stroke="#EB6081"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
