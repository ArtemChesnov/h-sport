import React from "react";

interface Props extends React.SVGProps<SVGSVGElement> {
  alt?: string;
}

/** Корзина (bag) outline из icons-redesign. */
export const CartIcon: React.FC<Props> = ({ className, ...props }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M16 6C16 3.79086 14.2091 2 12 2C9.79085 2 7.99999 3.79086 7.99999 6M6.8197 22H17.1803C19.6848 22 21.5733 19.7245 21.1118 17.2628L19.6118 9.26285C19.257 7.37095 17.6051 6 15.6803 6H8.3197C6.39484 6 4.74294 7.37096 4.38821 9.26285L2.88821 17.2628C2.42665 19.7245 4.31515 22 6.8197 22Z"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinejoin="round"
      />
    </svg>
  );
};

/** Корзина (bag) filled из icons-redesign. */
export const CartIconFilled: React.FC<Props> = ({ className, ...props }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.9999 1.25C9.9288 1.25 8.24987 2.92893 8.24987 5V6.0006C6.35496 6.03323 4.73853 7.39383 4.38809 9.26285L2.88809 17.2628C2.42653 19.7245 4.31502 22 6.81958 22H17.1802C19.6847 22 21.5732 19.7245 21.1117 17.2628L19.6117 9.26285C19.2612 7.39383 17.6448 6.03323 15.7499 6.0006V5C15.7499 2.92893 14.0709 1.25 11.9999 1.25ZM14.2499 6V5C14.2499 3.75736 13.2425 2.75 11.9999 2.75C10.7572 2.75 9.74987 3.75736 9.74987 5V6H14.2499Z"
        fill="currentColor"
      />
    </svg>
  );
};
