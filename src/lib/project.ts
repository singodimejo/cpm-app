class Project {
	steps: WorkStep[] = [];
}

class WorkStep {
	name: string = '';
	expectedTime: number = 0;
	dependencies: number[] = [];
	earliestStart: number = 0;
	earliestFinish: number = 0;
	latestStart: number = 0;
	latestFinish: number = 0;
	slack: number = 0;
	isCritical: boolean = false;
}

function isADependency(workStep: WorkStep, allSteps: WorkStep[]) {
	const workIndex = allSteps.findIndex((el) => el.name === workStep.name);
	return allSteps.some((el) => el.dependencies.includes(workIndex));
}

function hasDependencies(workStep: WorkStep) {
	return workStep.dependencies.length !== 0;
}

function calculateCPM(oldSteps: WorkStep[]) {
	let newSteps = oldSteps;

	newSteps = forwardFeed(newSteps);
	newSteps = backwardFeed(newSteps);
	newSteps = criticalityCalculator(newSteps);

	return newSteps;
}

function forwardFeed(oldSteps: WorkStep[]) {
	let newSteps = oldSteps;

	newSteps.forEach((step, _, steps) => {
		if (step.name === 'g') {
			console.log(step);
			console.log(hasDependencies(step));
		}
		if (hasDependencies(step)) {
			step.earliestStart = steps
				.filter((_, id) => step.dependencies.includes(id))
				.map((filteredStep) => filteredStep.earliestFinish)
				.reduce((maximumEF, currentEF) => (maximumEF >= currentEF ? maximumEF : currentEF), 0);
		}
		step.earliestFinish = step.earliestStart + step.expectedTime;
	});

	return newSteps;
}

function backwardFeed(oldSteps: WorkStep[]) {
	const PROJECT_DURATION = Math.max(...oldSteps.map((ws) => ws.earliestFinish));
	let newSteps = oldSteps;

	return newSteps
		.toReversed()
		.map((step, stepId) => {
			if (isADependency(step, newSteps)) {
				step.latestFinish = newSteps
					.filter((st) =>
						st.dependencies.includes(newSteps.findIndex((val) => val.name === step.name))
					)
					.map((step) => step.latestStart)
					.reduce(
						(minimumLS, currentLS) => (minimumLS <= currentLS ? minimumLS : currentLS),
						Infinity
					);
			} else {
				step.latestFinish = PROJECT_DURATION;
			}
			step.latestStart = step.latestFinish - step.expectedTime;
			return step;
		})
		.toReversed();
}

function criticalityCalculator(oldSteps: WorkStep[]) {
	let newSteps = oldSteps;

	newSteps.forEach((step) => {
		step.slack = step.latestStart - step.earliestStart;
		step.isCritical = step.slack === 0;
	});

	return newSteps;
}

export { WorkStep, calculateCPM };
