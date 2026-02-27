// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getDictionary = async (): Promise<any> => {
	return import("./en.json").then((m) => m.default);
};
