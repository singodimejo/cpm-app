<script lang="ts">
	import { onMount } from 'svelte';

    import { WorkStep } from '$lib/project';
	import createWorkStepStore from '$lib/work-step-store';

    const workStepStore = createWorkStepStore([])
    let newStep = new WorkStep()
    let workSteps: WorkStep[] = []

    onMount(() => {
        workStepStore.subscribe(arr => workSteps = arr)
    })

    $: newStep

    function addDependency(e: Event & { currentTarget: EventTarget & HTMLInputElement }, id:number) {
        if (e.currentTarget.checked) {
            newStep.dependencies = newStep.dependencies.toSpliced(newStep.dependencies.length, 0, id).toSorted()
            newStep = newStep
        } else {
            newStep.dependencies = newStep.dependencies.filter(val => val !== id).toSorted()
            newStep = newStep
        }
        newStep = newStep
    }
</script>

<h1 class="text-center text-4xl font-bold my-4">Critical Path Analyzer</h1>

<!-- Diagram -->

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
                    <td class=" text-center border border-slate-500">{ws.name}</td>
                    <td class=" text-center border border-slate-500">{ws.expectedTime}</td>
                    <td class=" text-center border border-slate-500">{ws.dependencies.map(val => workSteps.findIndex(el => el.name === workSteps[val].name) + 1)}</td>
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
    <button type="button" class="border border-slate-500 hover:bg-slate-500/15 transition-colors duration-150 rounded-sm p-3" on:click={() => {
        workStepStore.addNewStep(newStep)
        newStep = new WorkStep()
    }}>Add New Activity.</button>
</div>
