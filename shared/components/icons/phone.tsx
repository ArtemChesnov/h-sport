import React from "react";

interface Props extends React.SVGProps<SVGSVGElement> {
  alt?: string;
}

export const PhoneIcon: React.FC<Props> = ({
  width = 40,
  height = 40,
  className,
  ...props
}) => {
  return (
    <svg
      {...props}
      width={width}
      height={height}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M40 20C40 31.0456 31.0456 40 20 40C8.9543 40 0 31.0456 0 20C0 8.9543 8.9543 0 20 0C31.0456 0 40 8.9543 40 20ZM14 12C14 10.8954 14.8954 10 16 10H24C25.1046 10 26 10.8954 26 12V28C26 29.1046 25.1046 30 24 30H16C14.8954 30 14 29.1046 14 28V12ZM16 14H24V26H16V14Z"
        className={className}
      />
    </svg>
  );
};
