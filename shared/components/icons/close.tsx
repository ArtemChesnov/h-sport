import React from "react";

interface Props extends React.SVGProps<SVGSVGElement> {
  alt?: string;
}

export const CloseLogo: React.FC<Props> = ({
  width = 40,
  height = 40,
  className,
  ...props
}) => {
  return (
    <svg
      width={width}
      height={height}
      {...props}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="20" cy="20" r="15" />
      <path d="M15 25L25 15" />
      <path d="M25 25L15 15" />
    </svg>
  );
};
