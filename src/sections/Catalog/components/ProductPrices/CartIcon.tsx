export const CartIcon = ({ active }: { active: boolean }) => (
  <svg
    width="29"
    height="29"
    viewBox="0 0 29 29"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16.8633 20.5072C16.8633 19.7346 17.4887 19.1211 18.2494 19.1211C18.9977 19.1211 19.6197 19.7412 19.6355 20.5116C19.6331 21.2821 19.0087 21.8933 18.2494 21.8933C17.4768 21.8933 16.8633 21.2679 16.8633 20.5072Z"
      fill={active ? 'currentColor' : null}
      stroke="currentColor"
    />
    <path
      d="M9.49533 9.68535L9.55894 10.1115H9.98985H21.3996C21.4012 10.1118 21.4031 10.1121 21.4052 10.1125C21.4114 10.1137 21.4342 10.118 21.4541 10.121C21.4626 10.1223 21.4747 10.1241 21.4893 10.1257C21.6034 10.156 21.6684 10.2668 21.6499 10.3688L20.4724 16.256C20.3203 16.9538 19.7047 17.454 19.0033 17.454H11.4588C10.7288 17.454 10.1035 16.9114 9.99472 16.1936C9.99468 16.1933 9.99463 16.193 9.99459 16.1927L8.87046 8.5414L8.86859 8.52865L8.86607 8.51602C8.812 8.24569 8.57457 7.95086 8.19442 7.95086H6.72543C6.60258 7.95086 6.5 7.84827 6.5 7.72543C6.5 7.60258 6.60258 7.5 6.72543 7.5H8.19442C8.7639 7.5 9.23851 7.91714 9.31308 8.464L9.31304 8.46401L9.31397 8.47026L9.49533 9.68535Z"
      fill={active ? 'currentColor' : null}
      stroke="currentColor"
    />
    <path
      d="M13.1206 20.4347L13.1205 20.4347L13.1209 20.4428C13.16 21.1851 12.5747 21.8285 11.8107 21.8752H11.7885C11.0643 21.8752 10.4652 21.2944 10.4384 20.5619C10.4121 19.8084 10.9892 19.168 11.7651 19.1212C12.49 19.128 13.0943 19.7126 13.1206 20.4347Z"
      fill={active ? 'currentColor' : null}
      stroke="currentColor"
    />
    <path
      d="M0.5 14.5C0.5 12.3986 0.50022 10.8451 0.576319 9.60692C0.652179 8.37266 0.802107 7.48462 1.08718 6.71189C2.04909 4.10451 4.10451 2.04909 6.71189 1.08718C7.48462 0.802107 8.37266 0.652179 9.60692 0.576319C10.8451 0.50022 12.3986 0.5 14.5 0.5C16.6014 0.5 18.1549 0.50022 19.3931 0.576319C20.6273 0.652179 21.5154 0.802107 22.2881 1.08718C24.8955 2.04909 26.9509 4.10451 27.9128 6.71189C28.1979 7.48462 28.3478 8.37266 28.4237 9.60692C28.4998 10.8451 28.5 12.3986 28.5 14.5C28.5 16.6014 28.4998 18.1549 28.4237 19.3931C28.3478 20.6273 28.1979 21.5154 27.9128 22.2881C26.9509 24.8955 24.8955 26.9509 22.2881 27.9128C21.5154 28.1979 20.6273 28.3478 19.3931 28.4237C18.1549 28.4998 16.6014 28.5 14.5 28.5C12.3986 28.5 10.8451 28.4998 9.60692 28.4237C8.37266 28.3478 7.48462 28.1979 6.71189 27.9128C4.10451 26.9509 2.04909 24.8955 1.08718 22.2881C0.802107 21.5154 0.652179 20.6273 0.576319 19.3931C0.50022 18.1549 0.5 16.6014 0.5 14.5Z"
      stroke="currentColor"
    />
  </svg>
);

export default CartIcon;
