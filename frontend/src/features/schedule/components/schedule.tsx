import { TextHeading } from '@/components/text';
import { cn } from '@/lib/utils';

export default function Schedule({ className }: ComponentClassNameProp) {
	return (
		<div
			className={cn(
				'*:text-background grid aspect-video place-items-center rounded-2xl *:text-center',
				className
			)}
		>
			<TextHeading>Timetable</TextHeading>
		</div>
	);
}
