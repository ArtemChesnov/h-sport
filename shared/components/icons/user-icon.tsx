import React from "react";

interface Props extends React.SVGProps<SVGSVGElement> {
  alt?: string;
}

/** Пользователь (user) outline из icons-redesign. */
export const UserIcon: React.FC<Props> = ({ className, ...props }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M18.5588 19.5488C17.5654 16.8918 15.0036 15 12 15C8.99638 15 6.4346 16.8918 5.44117 19.5488M18.5588 19.5488C20.6672 17.7154 22 15.0134 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 15.0134 3.33285 17.7154 5.44117 19.5488M18.5588 19.5488C16.8031 21.0756 14.5095 22 12 22C9.49052 22 7.19694 21.0756 5.44117 19.5488M15 9C15 10.6569 13.6569 12 12 12C10.3431 12 9 10.6569 9 9C9 7.34315 10.3431 6 12 6C13.6569 6 15 7.34315 15 9Z"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinejoin="round"
      />
    </svg>
  );
};

/** Пользователь (user) filled из icons-redesign. */
export const UserIconFilled: React.FC<Props> = ({ className, ...props }) => {
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
        d="M22 12C22 15.0134 20.6672 17.7154 18.5588 19.5488C16.8031 21.0756 14.5095 22 12 22C9.49052 22 7.19694 21.0756 5.44117 19.5488C3.33285 17.7154 2 15.0134 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM12 19C13.7567 19 15.3622 18.3529 16.5912 17.2842C16.7327 17.1611 16.8692 17.0325 17.0003 16.8986C15.9194 15.1503 14.0833 14 12 14C9.91675 14 8.0806 15.1503 6.99969 16.8986C7.13086 17.0325 7.26735 17.1611 7.40884 17.2842C8.63788 18.3529 10.2434 19 12 19ZM12 12C13.6569 12 15 10.6569 15 9C15 7.34315 13.6569 6 12 6C10.3431 6 9 7.34315 9 9C9 10.6569 10.3431 12 12 12Z"
        fill="currentColor"
      />
    </svg>
  );
};
