const inject = func => {
	const scr = document.createElement("script");
	scr.classList.add("inject_script");
	const func_exec = func => `(${func.toString()})();`;
	scr.innerHTML = `(()=>{${func_exec(func)}})()`;
	document.head.appendChild(scr);
};

export { inject };
