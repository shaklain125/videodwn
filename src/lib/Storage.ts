const setLocal = async (key: string, value: any) => {
	return new Promise<void>(resolve => {
		chrome.storage.sync.set({ [key]: value }, () => {
			resolve();
		});
	});
};

const getLocal = async (key: string) => {
	return new Promise<any>(resolve => {
		chrome.storage.sync.get(key, function (found) {
			resolve(found[key]);
		});
	});
};

const updateKey = async (key: string, current_cb: (current: any) => any) => {
	return new Promise<void>(resolve => {
		getLocal(key).then(current => {
			setLocal(key, current_cb(current)).then(() => {
				resolve();
			});
		});
	});
};

const clearAll = async () => {
	return new Promise<void>(resolve => {
		chrome.storage.sync.get(null, items => {
			// console.log("ITEMS", items);
			chrome.storage.sync.remove(Object.keys(items), () => {
				resolve();
			});
		});
	});
};

const rmKey = async (key: string) => {
	return new Promise<void>(resolve => {
		chrome.storage.sync.remove(key, () => {
			resolve();
		});
	});
};

const getAll = async () => {
	return new Promise<any>(resolve => {
		chrome.storage.sync.get(null, items => {
			// console.log("ITEMS", items);
			resolve(items);
		});
	});
};

export { clearAll, updateKey, setLocal, getLocal, getAll, rmKey };

