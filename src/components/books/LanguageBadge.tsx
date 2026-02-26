import { FlagIcon } from "react-flag-kit";

interface LanguageBadgeProps {
	language_code: string;
}

export function LanguageBadge({ language_code }: LanguageBadgeProps) {
	const langmap = new Map<string, string>([
		["en", "UK"],
		["bn", "BD"],
		["ar", "SA"],
		["ur", "PK"],
	]);

	return (
		<div>
			{language_code && (
				<span
					className="absolute top-2 end-2 flex items-center gap-1 rounded-full
	bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300
	px-2 py-0.5 text-xs font-semibold text-black uppercase shadow-md"
				>
					<FlagIcon
						code={langmap.get(language_code)}
						size={16}
						className="rounded-full"
					/>
					<span>{language_code}</span>
				</span>
			)}
		</div>
	);
}
