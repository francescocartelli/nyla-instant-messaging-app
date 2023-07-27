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
      <linearGradient id="linear-gradient" x1="0.5" x2="0.5" y2="1" gradientUnits="objectBoundingBox">
        <stop offset="0" stopColor="#9e73ee" />
        <stop offset="1" stopColor="#84efea" />
      </linearGradient>
    </defs>
    <path d="M-1497.6-239.868q.266-.628.488-1.274l.006-.02a20.87,20.87,0,0,0,1.048-4.638A12.99,12.99,0,0,1-1500-255c0-7.732,7.164-14,16-14s16,6.268,16,14-7.164,14-16,14a18.08,18.08,0,0,1-4.693-.612,27.34,27.34,0,0,1-6.936,2.21q-.712.14-1.427.257a.515.515,0,0,1-.082.007A.522.522,0,0,1-1497.6-239.868ZM-1498-255a10.993,10.993,0,0,0,3.355,7.788,2,2,0,0,1,.574,1.6,21.927,21.927,0,0,1-.8,4,23.56,23.56,0,0,0,5.268-1.786,2,2,0,0,1,1.42-.148A16.164,16.164,0,0,0-1484-243c7.992,0,14-5.614,14-12s-6.008-12-14-12S-1498-261.384-1498-255Zm9,5.863a.98.98,0,0,1-1-1c0-1,1-4,6-4s6,3,6,4a.979.979,0,0,1-1,1Zm2-9a3,3,0,0,1,3-3,3,3,0,0,1,3,3,3,3,0,0,1-3,3A3,3,0,0,1-1487-258.137Z" transform="translate(1500 269)" fill="url(#linear-gradient)" />
  </svg>
}

function PeopleChat(props) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 32 29.862" {...props}>
    <defs>
      <linearGradient id="linear-gradient" x1="0.5" x2="0.5" y2="1" gradientUnits="objectBoundingBox">
        <stop offset="0" stopColor="#9e73ee" />
        <stop offset="1" stopColor="#84efea" />
      </linearGradient>
    </defs>
    <path d="M-1497.6-239.868q.266-.628.488-1.274l.006-.02a20.87,20.87,0,0,0,1.048-4.638A12.99,12.99,0,0,1-1500-255c0-7.732,7.164-14,16-14s16,6.268,16,14-7.164,14-16,14a18.08,18.08,0,0,1-4.693-.612,27.34,27.34,0,0,1-6.936,2.21q-.712.14-1.427.257a.515.515,0,0,1-.082.007A.522.522,0,0,1-1497.6-239.868ZM-1498-255a10.993,10.993,0,0,0,3.355,7.788,2,2,0,0,1,.574,1.6,21.927,21.927,0,0,1-.8,4,23.56,23.56,0,0,0,5.268-1.786,2,2,0,0,1,1.42-.148A16.164,16.164,0,0,0-1484-243c7.992,0,14-5.614,14-12s-6.008-12-14-12S-1498-261.384-1498-255Zm13,5.863a.979.979,0,0,1-1-1c0-1,1-4,5-4s5,3,5,4a.979.979,0,0,1-1,1Zm-6,0a.979.979,0,0,1-1-1c0-1,1-4,5-4a6.356,6.356,0,0,1,1.936.28,4.772,4.772,0,0,0-1.936,3.721,2.236,2.236,0,0,0,.216,1Zm7-9a3,3,0,0,1,3-3,3,3,0,0,1,3,3,3,3,0,0,1-3,3A3,3,0,0,1-1484-258.137Zm-6,.5a2.5,2.5,0,0,1,2.5-2.5,2.5,2.5,0,0,1,2.5,2.5,2.5,2.5,0,0,1-2.5,2.5A2.5,2.5,0,0,1-1490-257.638Z" transform="translate(1500 269)" fill="url(#linear-gradient)" />
  </svg>

}

export { Logo, LogoGrad, PersonChat, PeopleChat }