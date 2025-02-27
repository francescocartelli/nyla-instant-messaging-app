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

export default LogoGrad