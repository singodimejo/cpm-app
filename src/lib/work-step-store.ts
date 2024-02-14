import { writable, type Updater } from 'svelte/store';
import { calculateCPM, type WorkStep } from './project';

export default function createWorkStepStore(initialSteps: WorkStep[]) {
	const workStepList = writable<WorkStep[]>(initialSteps);

	function addNewStep(newWorkStep: WorkStep) {
		workStepList.update((workStepList) =>
			calculateCPM(workStepList.toSpliced(workStepList.length, 0, newWorkStep))
		);
	}

	function recalculateCPM() {
		workStepList.update((workStepList) =>
			calculateCPM(workStepList)
		);
	}

	return {
		...workStepList,
		addNewStep,
		recalculateCPM
	};
}
