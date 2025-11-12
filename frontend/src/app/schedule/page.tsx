import Button from '@/components/button';
import Container from '@/components/container';
import Schedule from '@/features/schedule/components/schedule';

export default function SchedulePage() {
	return (
		<Container className="mt-16 max-w-[1440px]">
			<div className="flex flex-row gap-4">
				<div className="flex flex-col gap-4">
					<Button variant="outline">Pick a Display</Button>
					<Button variant="outline">Add Course</Button>
					<Button variant="outline">Edit Class</Button>
					<Button variant="outline">Delete Class</Button>
					<Button variant="outline">Export</Button>
					<Button variant="outline">Import</Button>
					<Button variant="outline">New Schedule</Button>
				</div>
				<Schedule className="grow bg-orange-500" />
			</div>
		</Container>
	);
}
