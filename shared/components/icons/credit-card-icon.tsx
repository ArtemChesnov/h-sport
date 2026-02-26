import React from "react";

interface Props extends React.SVGProps<SVGSVGElement> {
  alt?: string;
  pathClassName?: string;
}

export const CreditCardIcon: React.FC<Props> = ({
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
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className={pathClassName}
        d="M4.66602 11.566C4.66602 10.5409 4.66602 10.0283 4.86867 9.63821C5.03945 9.30946 5.3075 9.0414 5.63626 8.87062C6.02639 8.66797 6.53893 8.66797 7.56402 8.66797H24.4347C25.4598 8.66797 25.9723 8.66797 26.3624 8.87062C26.6912 9.0414 26.9593 9.30946 27.13 9.63821C27.3327 10.0283 27.3327 10.5409 27.3327 11.566V21.77C27.3327 22.7951 27.3327 23.3076 27.13 23.6977C26.9593 24.0265 26.6912 24.2945 26.3624 24.4653C25.9723 24.668 25.4598 24.668 24.4347 24.668H7.56401C6.53893 24.668 6.02639 24.668 5.63626 24.4653C5.3075 24.2945 5.03945 24.0265 4.86867 23.6977C4.66602 23.3076 4.66602 22.7951 4.66602 21.77V11.566Z"
        stroke="#EB6081"
      />
      <path
        className={pathClassName}
        d="M4.66602 14L27.3327 14"
        stroke="#EB6081"
        strokeLinecap="round"
      />
      <circle
        className={pathClassName}
        cx="8.66667"
        cy="20.6667"
        r="0.5"
        fill="#EB6081"
        stroke="#EB6081"
        strokeWidth="0.333333"
      />
    </svg>
  );
};
