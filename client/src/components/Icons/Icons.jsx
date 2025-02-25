function Logo(props) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16" {...props}>
    <path d="M0,5.333v0Z" transform="translate(2.667 10.667) rotate(180)" fill="#1376aa" />
    <path d="M0,2.667,2.667,5.333V0Z" transform="translate(5.333 10.667) rotate(180)" fill="#7ec6ed" />
    <path d="M2.667,2.667,0,5.333V0Z" transform="translate(5.333 13.333) rotate(180)" fill="#b0ddf5" />
    <path d="M2.667,2.667,0,5.333V0Z" transform="translate(5.333 8) rotate(180)" fill="#61b9e8" />
    <path d="M0,2.667,2.667,5.333V0Z" transform="translate(8 8) rotate(180)" fill="#48a6d8" />
    <path d="M2.667,2.667,0,5.333V0Z" transform="translate(10.667 8) rotate(180)" fill="#256f96" />
    <path d="M2.667,2.667,0,5.333V0Z" transform="translate(8 5.333) rotate(180)" fill="#288dc3" />
    <path d="M2.667,2.667,0,5.333V0Z" transform="translate(13.333 10.667) rotate(180)" fill="#225a77" />
    <path d="M0,2.667,2.667,5.333V0Z" transform="translate(8 13.333) rotate(180)" fill="#c3e5f7" />
    <path d="M0,2.667,2.667,5.333V0Z" transform="translate(10.667 5.333) rotate(180)" fill="#1d79aa" />
    <path d="M0,2.667,2.667,5.333V0Z" transform="translate(13.333 8) rotate(180)" fill="#276383" />
    <path d="M0,2.667,2.667,5.333V0Z" transform="translate(13.333 13.333) rotate(180)" fill="#16445c" />
    <path d="M2.667,2.667,0,5.333V0Z" transform="translate(8 16) rotate(180)" fill="#d4ecf8" />
    <path d="M0,2.667,2.667,0V5.333Z" transform="translate(0 5.333)" fill="#93cfef" />
    <path d="M2.667,2.667,0,0V5.333Z" transform="translate(13.333 5.333)" fill="#1b4f6a" />
  </svg>
}

function LogoGrad(props) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 32 32" {...props}>
    <defs>
      <linearGradient id="radial-gradient" cx="0.5" cy="0.5" r="0.5" gradientUnits="objectBoundingBox">
        <stop offset="0" stopColor="#d4ecf8" />
        <stop offset="0.425" stopColor="#1d79aa" />
        <stop offset="1" stopColor="#16445c" />
      </linearGradient>
    </defs>
    <path d="M55,68,39,52,55,36,71,52,60,63V52l-5-5-5,5,5,5Z" transform="translate(-39 -36)" fill="url(#radial-gradient)" />
  </svg>
}

function PersonChat(props) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 32 29.862" {...props}>
    <defs>
      <linearGradient id="linear-gradient-red" x1="0.5" x2="0.5" y2="1" gradientUnits="objectBoundingBox">
        <stop offset="0" stopColor="#cb7bd6" />
        <stop offset="1" stopColor="#6faaee" />
      </linearGradient>
    </defs>
    <path d="M-1497.6-239.868q.266-.628.488-1.274l.006-.02a20.87,20.87,0,0,0,1.048-4.638A12.99,12.99,0,0,1-1500-255c0-7.732,7.164-14,16-14s16,6.268,16,14-7.164,14-16,14a18.08,18.08,0,0,1-4.693-.612,27.34,27.34,0,0,1-6.936,2.21q-.712.14-1.427.257a.515.515,0,0,1-.082.007A.522.522,0,0,1-1497.6-239.868ZM-1498-255a10.993,10.993,0,0,0,3.355,7.788,2,2,0,0,1,.574,1.6,21.927,21.927,0,0,1-.8,4,23.56,23.56,0,0,0,5.268-1.786,2,2,0,0,1,1.42-.148A16.164,16.164,0,0,0-1484-243c7.992,0,14-5.614,14-12s-6.008-12-14-12S-1498-261.384-1498-255Zm9,5.863a.98.98,0,0,1-1-1c0-1,1-4,6-4s6,3,6,4a.979.979,0,0,1-1,1Zm2-9a3,3,0,0,1,3-3,3,3,0,0,1,3,3,3,3,0,0,1-3,3A3,3,0,0,1-1487-258.137Z" transform="translate(1500 269)" fill="url(#linear-gradient-red)" />
  </svg>
}

function PeopleChat(props) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 32 29.862" {...props}>
    <defs>
      <linearGradient id="linear-gradient-green" x1="0.5" x2="0.5" y2="1" gradientUnits="objectBoundingBox">
        <stop offset="0" stopColor="#9e73ee" />
        <stop offset="1" stopColor="#84efea" />
      </linearGradient>
    </defs>
    <path d="M-1497.6-239.868q.266-.628.488-1.274l.006-.02a20.87,20.87,0,0,0,1.048-4.638A12.99,12.99,0,0,1-1500-255c0-7.732,7.164-14,16-14s16,6.268,16,14-7.164,14-16,14a18.08,18.08,0,0,1-4.693-.612,27.34,27.34,0,0,1-6.936,2.21q-.712.14-1.427.257a.515.515,0,0,1-.082.007A.522.522,0,0,1-1497.6-239.868ZM-1498-255a10.993,10.993,0,0,0,3.355,7.788,2,2,0,0,1,.574,1.6,21.927,21.927,0,0,1-.8,4,23.56,23.56,0,0,0,5.268-1.786,2,2,0,0,1,1.42-.148A16.164,16.164,0,0,0-1484-243c7.992,0,14-5.614,14-12s-6.008-12-14-12S-1498-261.384-1498-255Zm13,5.863a.979.979,0,0,1-1-1c0-1,1-4,5-4s5,3,5,4a.979.979,0,0,1-1,1Zm-6,0a.979.979,0,0,1-1-1c0-1,1-4,5-4a6.356,6.356,0,0,1,1.936.28,4.772,4.772,0,0,0-1.936,3.721,2.236,2.236,0,0,0,.216,1Zm7-9a3,3,0,0,1,3-3,3,3,0,0,1,3,3,3,3,0,0,1-3,3A3,3,0,0,1-1484-258.137Zm-6,.5a2.5,2.5,0,0,1,2.5-2.5,2.5,2.5,0,0,1,2.5,2.5,2.5,2.5,0,0,1-2.5,2.5A2.5,2.5,0,0,1-1490-257.638Z" transform="translate(1500 269)" fill="url(#linear-gradient-green)" />
  </svg>
}

function Crown(props) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" {...props}>
    <path fillRule="evenodd" clipRule="evenodd" d="M2 11.4643L0 6.46428C0 6.46428 1.59014 7.41123 2.5 7C3.62534 6.49138 3.5 4 3.5 4C3.5 4 4.7547 6.11161 6 6C7.40243 5.87431 8 3 8 3C8 3 8.59757 5.87431 10 6C11.2453 6.11161 12.5 4 12.5 4C12.5 4 12.3747 6.49138 13.5 7C14.4099 7.41123 16 6.46428 16 6.46428L14 11.4643H13.9994C13.9535 10.1 11.2851 9 8 9C4.71492 9 2.04646 10.1 2.0006 11.4643H2ZM12.5348 11.3373C12.5349 11.3373 12.5343 11.3382 12.5331 11.3401L12.5348 11.3373ZM12.3648 11.5C12.2219 11.3901 11.9961 11.2545 11.6657 11.1168C10.8035 10.7576 9.50831 10.5 8 10.5C6.49169 10.5 5.19653 10.7576 4.33428 11.1168C4.00389 11.2545 3.77808 11.3901 3.63517 11.5C3.77808 11.6099 4.00389 11.7455 4.33428 11.8832C5.19653 12.2424 6.49169 12.5 8 12.5C9.50831 12.5 10.8035 12.2424 11.6657 11.8832C11.9961 11.7455 12.2219 11.6099 12.3648 11.5ZM3.46517 11.3373L3.46692 11.3401C3.46565 11.3382 3.46512 11.3373 3.46517 11.3373ZM3.46517 11.6627C3.46512 11.6627 3.46565 11.6618 3.46692 11.6599L3.46517 11.6627ZM12.5331 11.6599C12.5343 11.6618 12.5349 11.6627 12.5348 11.6627L12.5331 11.6599Z" />
  </svg>
}

function XCrown(props) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" {...props}>
    <path fillRule="evenodd" clipRule="evenodd" d="M2.03748 3.69158C2.06264 3.75232 2.09952 3.80751 2.14601 3.854L7.29301 9L2.14601 14.146C2.09952 14.1925 2.06264 14.2477 2.03748 14.3084C2.01232 14.3692 1.99937 14.4343 1.99937 14.5C1.99937 14.5657 2.01232 14.6308 2.03748 14.6916C2.06264 14.7523 2.09952 14.8075 2.14601 14.854C2.19249 14.9005 2.24768 14.9374 2.30842 14.9625C2.36916 14.9877 2.43426 15.0006 2.50001 15.0006C2.56575 15.0006 2.63085 14.9877 2.69159 14.9625C2.75233 14.9374 2.80752 14.9005 2.85401 14.854L8.00001 9.707L13.146 14.854C13.1925 14.9005 13.2477 14.9374 13.3084 14.9625C13.3692 14.9877 13.4343 15.0006 13.5 15.0006C13.5657 15.0006 13.6308 14.9877 13.6916 14.9625C13.7523 14.9374 13.8075 14.9005 13.854 14.854C13.9005 14.8075 13.9374 14.7523 13.9625 14.6916C13.9877 14.6308 14.0006 14.5657 14.0006 14.5C14.0006 14.4343 13.9877 14.3692 13.9625 14.3084C13.9374 14.2477 13.9005 14.1925 13.854 14.146L8.70701 9L13.854 3.854C13.9005 3.80751 13.9374 3.75232 13.9625 3.69158C13.9877 3.63084 14.0006 3.56574 14.0006 3.5C14.0006 3.43426 13.9877 3.36916 13.9625 3.30842C13.9374 3.24768 13.9005 3.19249 13.854 3.146C13.8075 3.09951 13.7523 3.06264 13.6916 3.03748C13.6308 3.01232 13.5657 2.99937 13.5 2.99937C13.4343 2.99937 13.3692 3.01232 13.3084 3.03748C13.2477 3.06264 13.1925 3.09951 13.146 3.146L8.00001 8.293L2.85401 3.146C2.80752 3.09951 2.75233 3.06264 2.69159 3.03748C2.63085 3.01232 2.56575 2.99937 2.50001 2.99937C2.43426 2.99937 2.36916 3.01232 2.30842 3.03748C2.24768 3.06264 2.19249 3.09951 2.14601 3.146C2.09952 3.19249 2.06264 3.24768 2.03748 3.30842C2.01232 3.36916 1.99937 3.43426 1.99937 3.5C1.99937 3.56574 2.01232 3.63084 2.03748 3.69158ZM2.5 7C2.79459 6.86685 3.00347 6.59784 3.15133 6.27321L5.87865 9L5.68592 9.1927C3.54569 9.56575 2.03441 10.4406 2 11.4643L0 6.46428C0 6.46428 1.59014 7.41123 2.5 7ZM8.00001 11.1214L6.68874 12.4329C7.10197 12.4762 7.54112 12.5 8 12.5C8.45888 12.5 8.89803 12.4762 9.31127 12.4329L8.00001 11.1214ZM10.1214 9L10.3141 9.1927C12.4543 9.56575 13.9656 10.4406 14 11.4643L16 6.46428C16 6.46428 14.4099 7.41123 13.5 7C13.2054 6.86686 12.9965 6.59784 12.8487 6.27322L10.1214 9ZM8 3C8 3 8.38019 4.82873 9.24578 5.63263L8.00001 6.87865L6.75423 5.63263C7.61981 4.82873 8 3 8 3ZM12.5348 11.3373C12.5349 11.3373 12.5343 11.3382 12.5331 11.3401L12.5348 11.3373ZM3.46517 11.3373L3.46692 11.3401C3.46565 11.3382 3.46512 11.3373 3.46517 11.3373Z" />
  </svg>
}

function GoogleColored(props) {
  return <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="1em" height="1em" viewBox="0 0 48 48" {...props}>
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
  </svg>
}

export { Logo, LogoGrad, PersonChat, PeopleChat, Crown, XCrown, GoogleColored }