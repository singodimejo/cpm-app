<script lang="ts">
	import { createEventDispatcher } from "svelte";
    import { WorkStep } from "$lib/project";
    import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
    import { Button } from '$lib/components/ui/button'
 
    export let workSteps: WorkStep[]
    export let id: number 
    export let dependencies = workSteps[id].dependencies

    let dependableStepIds: number[] = workSteps.filter((val,vid) => vid < id).map((_,vid) => vid)
    // let container: HTMLDivElement
    let dispatch = createEventDispatcher()
</script>

{#if id !== 0}
    <DropdownMenu.Root closeOnItemClick={false}>
        <DropdownMenu.Trigger class="w-full m-0">
            <Button variant="ghost" size="sm" class="w-full rounded-none hover:bg-slate-300">
                {#if dependencies.length > 0}
                {dependencies.map(val => workSteps[val].name)}
                {:else}
                ---    
                {/if}
            </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
            {#each dependableStepIds as dep}
            <DropdownMenu.CheckboxItem
                checked={workSteps[id].dependencies.includes(dep)}
                onCheckedChange={(isChecked) => {
                    if (isChecked) {
                        dependencies.push(dep)
                        dependencies.sort()
                        dependencies = dependencies
                    } else {
                        dependencies = dependencies.filter((val) => val !== dep)
                    }
                    dispatch('change')
                }}
            >
                {workSteps[dep].name}
            </DropdownMenu.CheckboxItem>
            {/each}
        </DropdownMenu.Content>
    </DropdownMenu.Root>
{:else}
    <p>---</p>
{/if}