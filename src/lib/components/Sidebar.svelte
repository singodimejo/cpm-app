<script lang="ts">
	import { cn } from "$lib/utils";
	import { Button } from "$lib/components/ui/button";

	let className: string | null | undefined = undefined;
	export { className as class };
</script>

<div class={cn("pb-12 border border-r min-h-screen", className)}>
	<div class="space-y-4 py-4">
        <a href="/" class="p-2 flex justify-center items-center hover:bg-secondary">
            <img src="/PT_Pertamina_Patra_Niaga.svg" class="w-3/4" alt="">
        </a>
		<div class="px-3 py-2">
			<h2 class="mb-2 px-4 text-lg font-semibold tracking-tight">Projects</h2>
			<div class="space-y-1">
                <Button variant='ghost' class='w-full justify-start'>
                    New Project
                </Button>
                <Button variant='ghost' class='w-full justify-start'>
                    Existing Projects
                </Button>
			</div>
		</div>
        <div class="px-3 py-2">
			<h2 class="mb-2 px-4 text-lg font-semibold tracking-tight">RKS</h2>
			<div class="space-y-1">
                <Button variant='ghost' class='w-full justify-start'>
                    Plan
                </Button>
                <a href="/cpm">
                    <Button variant='ghost' class='w-full justify-start'>
                        Schedule
                    </Button>
                </a>
                <Button variant='ghost' class='w-full justify-start'>
                    Draft
                </Button>
			</div>
		</div>
        <div class="px-3 py-2">
			<h2 class="mb-2 px-4 text-lg font-semibold tracking-tight">OE</h2>
			<div class="space-y-1">
                <!-- OE Sub Menus Here -->
			</div>
		</div>
        <div class="px-3 py-2">
			<h2 class="mb-2 px-4 text-lg font-semibold tracking-tight">Pakta Integritas</h2>
			<div class="space-y-1">
                <!-- Pakta Integritas Sub Menus Here -->
			</div>
		</div>
	</div>
</div>