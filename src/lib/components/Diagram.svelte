<script lang="ts">
  import mermaid from 'mermaid';
	import { onMount } from 'svelte';
  
  export let diagram: string = '';
  
  let svg: string = ''
  let container: HTMLDivElement

  onMount(async () => {
    mermaid.initialize({ startOnLoad: true })
    await mermaid.run()
  })

  $: if (container) {
    mermaid.render('mermaid', diagram).then(res => svg = res.svg).catch(err => console.log(err))
  }
</script>

<div class="border-2 border-dashed border-slate-500 m-4 p-1" bind:this={container}>
  {@html svg}
</div>
