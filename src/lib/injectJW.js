import { inject } from "@src/lib/inject";

export const injectJW = () => {
	const ev = `() => {
		const getPlayer = async () => {
			const checkPlayer = player => player && Object.keys(player).length > 1;
			const is_func = functionToCheck =>
				functionToCheck &&
				["[object Function]", "[object AsyncFunction]"].includes(
					{}.toString.call(functionToCheck)
				);
			const fetch = () => {
				try {
					const id = document.querySelector(".jwplayer").getAttribute("id");
					return jwplayer && is_func(jwplayer) ? (id ? jwplayer(id) : jwplayer()) : null;
				} catch (error) {
					return null;
				}
			};
			return new Promise(async resolve => {
				var resolved = false;
				setTimeout(() => {
					if (!resolved) {
						resolved = true;
						resolve(null);
					}
				}, 5000);
				const i = setInterval(() => {
					if (!resolved) {
						const player = fetch();
						if (checkPlayer(player)) {
							resolved = true;
							clearInterval(i);
							resolve(player);
						}
					}
				}, 1);
			});
		};

		getPlayer().then(p => {
			if (!p) {
				window.postMessage({ type: "jwplayer", data: null }, "*");
			} else {
				try {
					window.postMessage({ type: "jwplayer", data: p.getConfig()?.sources }, "*");
				} catch (error) {
					window.postMessage({ type: "jwplayer", data: null }, "*");
				}
			}
		});
	}`;
	inject(ev);
};
