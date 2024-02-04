<script>
    import "../app.pcss";
    import Sidebar from "$lib/components/Sidebar.svelte";
</script>

<div class="grid grid-cols-5">
    <Sidebar />
    <div class="col-span-4">
        <slot></slot>
    </div>
</div>