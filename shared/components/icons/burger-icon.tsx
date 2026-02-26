import React from "react";

interface Props extends React.SVGProps<SVGSVGElement> {
  alt?: string;
}

/** Бургер из icons-redesign: три линии разной длины, толщина 1.25. */
export const BurgerIcon: React.FC<Props> = ({ className, ...props }) => {
  return (
    <svg
      viewBox="0 0 40 35"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M1 1H39M1 17.5H29M1 34H19"
        stroke="currentColor"
        strokeWidth={2.25}
        strokeLinecap="round"
      />
    </svg>
  );
};
