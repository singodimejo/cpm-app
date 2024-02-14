<script lang="ts">
	import { onMount } from 'svelte';

    import { WorkStep, isADependency } from '$lib/project';
	import createWorkStepStore from '$lib/work-step-store';
	import Diagram from '$lib/components/Diagram.svelte';
    import { Button } from '$lib/components/ui/button';
    import DependenciesInput from './dependenciesInput.svelte';

    const workStepStore = createWorkStepStore([])
    let newStep = new WorkStep()
    let workSteps: WorkStep[] = []
    let diagram: string = `
    flowchart TD
    A["Start Adding Steps Down Below!"]`


    onMount(() => {
        workStepStore.subscribe(arr => workSteps = arr)
    })

    $: newStep

    function addDependency(e: Event & { currentTarget: EventTarget & HTMLInputElement }, id:number) {
        if (e.currentTarget.checked) {
            newStep.dependencies = newStep.dependencies.toSpliced(newStep.dependencies.length, 0, id).toSorted()
        } else {
            newStep.dependencies = newStep.dependencies.filter(val => val !== id).toSorted()
        }
        newStep = newStep
    }

    //render diagram
    function diagramTextWriter(workStepArr: WorkStep[]): string {
        let text = 'flowchart LR\n'
        let linkTracker: number = 0
        workStepArr.forEach((step, stepid, stepsArr) => {
            text = text.concat(`${stepid}["
${step.earliestStart} | ${step.expectedTime} | ${step.earliestFinish}
${step.name}
${step.latestStart} | ${step.slack} | ${step.latestFinish}
"]${step.isCritical ? `\n style ${stepid} stroke:#F00\n` : ''}\n`)

            if (step.dependencies.length !== 0) {
                step.dependencies.forEach(dep => {
                    text = text.concat(`${dep} --> ${stepid}\n`)
                    if (stepsArr[dep].isCritical && step.isCritical) text = text.concat(`linkStyle ${linkTracker} stroke:#F00\n`)
                    linkTracker++
                })
            }

            if (!isADependency(step, stepsArr)) {
                text = text.concat(`${stepid} --> Final\n
${step.isCritical ? `linkStyle ${linkTracker} stroke:#F00` : ''}\n`)
                linkTracker++
            }
        })

        text = text.concat(`
\n ID["ES | T | EF
Activity Name
LS | S | LF"]

Final["
Final Project Time: ${workStepArr.findLast((_, id, arr) => id === arr.length - 1)!.latestFinish}
"]
`) 
        return text.toString()
    }
</script>

<h1 class="text-center text-4xl font-bold my-4">Critical Path Method Schedule</h1>

<!-- Diagram -->
<Diagram {diagram}/>

<!-- table -->
<div class="w-full py-2 px-4">
    <table class="table w-full">
        <thead>
            <th class="border border-slate-500">No.</th>
            <th class="border border-slate-500">Activity</th>
            <th class="border border-slate-500">Expected Time</th>
            <th class="border border-slate-500">Dependencies</th>
            <th class="border border-slate-500">Earliest Start</th>
            <th class="border border-slate-500">Earliest Finish</th>
            <th class="border border-slate-500">Latest Start</th>
            <th class="border border-slate-500">Latest Finish</th>
            <th class="border border-slate-500">Slack</th>
            <th class="border border-slate-500">Is on Critical Path?</th>
        </thead>
        <tbody>
            {#if workSteps.length !== 0}
            {#each workSteps as ws}
                <tr>
                    <td class=" text-center border border-slate-500">{workSteps.findIndex(el => el.name === ws.name) + 1}.</td>
                    <td class=" text-center border border-slate-500">
                        <input type="text" class="text-center"
                            bind:value={ws.name}
                            on:input={() => {
                                diagram = diagramTextWriter(workSteps)
                                diagram = diagram
                            }}
                        >
                    </td>
                    <td class=" text-center border border-slate-500">
                        <input type="number" class="text-center" 
                            bind:value={ws.expectedTime} 
                            on:input={() => {
                                workStepStore.recalculateCPM()
                                diagram = diagramTextWriter(workSteps)
                                diagram = diagram
                            }}
                        >
                    </td>
                    <td class=" text-center border border-slate-500">
                        <DependenciesInput 
                            {workSteps} 
                            id={workSteps.findIndex((val) => val.name === ws.name)} 
                            bind:dependencies={ws.dependencies}
                            on:change={() => {
                                workStepStore.recalculateCPM()
                                diagram = diagramTextWriter(workSteps)
                                diagram = diagram
                            }}
                        />
                        <!-- {ws.dependencies.map(val => workSteps.findIndex(el => el.name === workSteps[val].name) + 1)} -->
                    </td>
                    <td class=" text-center border border-slate-500">{ws.earliestStart}</td>
                    <td class=" text-center border border-slate-500">{ws.earliestFinish}</td>
                    <td class=" text-center border border-slate-500">{ws.latestStart}</td>
                    <td class=" text-center border border-slate-500">{ws.latestFinish}</td>
                    <td class=" text-center border border-slate-500">{ws.slack}</td>
                    <td class=" text-center border border-slate-500">{ws.isCritical}</td>
                </tr>
            {/each}
            {:else}
                <tr>
                    <td colspan=10 class="border border-slate-500">
                        <p>No Data Yet...</p>
                    </td>
                </tr>
            {/if}
        </tbody>
    </table>
</div>

<!-- form -->
<div class="w-full px-4 py-2">
    <label for="name">Task Name</label>
    <input type="text" name="name" id="workname"
        class="border border-slate-500 p-2 block my-2 w-full"
        bind:value={newStep.name}
        placeholder="Task Name Here..."
    >

    <label for="expectedTime">Task Duration (months)</label>
    <input type="number" name="expectedTime" id="worktime"
        class="border border-slate-500 p-2 block my-2 w-full"
        bind:value={newStep.expectedTime}
    >

    <fieldset class="border border-slate-500 p-2 mb-4">
        <legend>Dependencies</legend>
        {#if workSteps.length !== 0}
            {#each workSteps as ws}
                <div>
                    <input type="checkbox" class="border" name="dependency"
                        checked={newStep.dependencies.includes(workSteps.findIndex(s => s.name === ws.name))}
                        on:change={(e) => addDependency(e, workSteps.findIndex(s => s.name === ws.name))}
                    >
                    <label for="dependecy">{ws.name}</label>
                </div>
            {/each}
        {:else}
                <p>No Dependable Activity Yet...</p>
        {/if}
    </fieldset>
    <Button variant="outline" class="py-6" on:click={() => {
        workStepStore.addNewStep(newStep)
        diagram = diagramTextWriter(workSteps)
        diagram = diagram
        newStep = new WorkStep()
    }}>
        Add New Activity
    </Button>
</div>
