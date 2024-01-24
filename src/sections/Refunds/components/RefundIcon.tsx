import { CSSProperties, FC } from 'react';

const RefundIcon: FC<{ big?: boolean; style?: CSSProperties }> = props =>
  props.big ? (
    <svg
      width="30"
      height="20"
      viewBox="0 0 30 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="color-primary rollback-icon"
      style={props.style}
    >
      <path
        d="M1.94141 5.52832H23.1791C26.2035 5.52832 28.6566 7.86057 28.6566 11.7254C28.6566 15.5903 26.2035 18.7555 23.1791 18.7555H10.4096"
        stroke="#E5332A"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.81348 1L1 5.53123L6.54465 9.66265"
        stroke="#E5332A"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ) : (
    <svg
      width="17"
      height="12"
      viewBox="0 0 17 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="color-primary rollback-icon"
      style={props.style}
    >
      <path
        d="M1.51758 3.49023H13.1879C14.8498 3.49023 16.1978 4.77182 16.1978 6.8956C16.1978 9.01938 14.8498 10.7587 13.1879 10.7587H6.17092"
        stroke="#E5332A"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.19456 1L1 3.48995L4.04683 5.76019"
        stroke="#E5332A"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

export default RefundIcon;
