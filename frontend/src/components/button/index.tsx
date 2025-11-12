import { cn } from '@/lib/utils';
import { textBodyClassNames } from '../text';
import { cva } from 'class-variance-authority';

const buttonVariants = cva(
	"[&_svg:not([class*='size-'])] inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3 whitespace-nowrap outline-none hover:cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none transition-all",
	{
		variants: {
			variant: {
				default:
					'bg-foreground hover:bg-foreground/90 text-background hover:bg-foreground/90',
				outline:
					'bg-background hover:bg-background/90 border border-x-2 border-t-2 border-b-5 border-muted text-foreground hover:bg-muted/20',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	}
);

export default function Button({
	className,
	children,
	variant,
}: {
	variant?: 'default' | 'outline';
} & ComponentClassNameAndChildrenProp) {
	return (
		<button
			className={cn(
				textBodyClassNames,
				'font-heading font-[850] tracking-[0.3px]',
				buttonVariants({ variant }),
				className
			)}
		>
			{children}
		</button>
	);
}
