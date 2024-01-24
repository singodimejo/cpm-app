<script lang="ts">
  import mermaid from 'mermaid';
	import { onMount } from 'svelte';

    // The default diagram
  export let diagram: string;

  let svg: string

  onMount(() => {
    mermaid.init({ startOnLoad: false })
  })

  $: mermaid.render('mermaid', diagram).then(res => svg = res.svg).catch(err => console.log(err))
    
  $: diagram
</script>

<div class="border-2 border-dashed border-slate-500 m-4 p-1">
  {@html svg}
</div>