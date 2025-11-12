import { cn } from '@/lib/utils';

export default function Container({
	className,
	children,
}: ComponentClassNameAndChildrenProp) {
	return (
		<div className={cn('mx-auto w-full max-w-[1000px] px-4', className)}>
			{children}
		</div>
	);
}
