<script lang="ts">
    import * as d3 from 'd3'
    import type { DateRange } from 'bits-ui';
    import {
        type DateValue,
        DateFormatter,
        getLocalTimeZone,
		CalendarDate,
    } from "@internationalized/date";
    import { Calendar as CalendarIcon } from 'lucide-svelte';

    import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
    import * as Popover from '$lib/components/ui/popover'
    import { Button } from './ui/button';
    import { Separator } from '$lib/components/ui/separator'
    import { Calendar } from '$lib/components/ui/calendar'
    import { RangeCalendar } from '$lib/components/ui/range-calendar'

    import { cn } from '$lib/utils';
	import { WorkStep, numberToRupiahConverter } from "$lib/project";

    export let workSteps: WorkStep[]
    export let margin = {
        left: 75,
        top: 50,
        right: 50,
        bottom: 75,
    }
    
    let filter: 'earliest' | 'latest' | 'both' = 'both'
    let width: number = 400
    let height: number = 400
    let gx: SVGGElement
    let gy: SVGGElement
    let chartContainer: HTMLDivElement
    let projectStartDate: Date
    let costInRange: number
    
    const dateFormatterLong = new DateFormatter("en-US", {
        dateStyle: "long"
    });
    const dateFormatterShort = new DateFormatter("en-US", {
        dateStyle: "medium"
    });
    
    let calendarStartDate: DateValue | undefined
    let calendarCostStartDate: DateValue | undefined
    let calendarCostEndDate: DateValue | undefined
    
    $: calendarStartDate
    $: if (costDateRangeStart && costDateRangeEnd) {
        costInRange = costCalculator(
            workSteps, 
            xScale.invert(timeScale(costDateRangeStart)),
            xScale.invert(timeScale(costDateRangeEnd)),
            filter
        )
    }
    $: projectStartDate = calendarStartDate ? calendarStartDate.toDate('UTC') : new Date("2024-01-01")
    $: costDateRangeStart = dateRange.start ? dateRange.start.toDate('UTC') : undefined satisfies Date | undefined
    $: costDateRangeEnd = dateRange.end ? dateRange.end.toDate('UTC') : undefined satisfies Date | undefined
    
    let dateRange = {
        start: calendarCostStartDate,
        end: calendarCostEndDate
    } satisfies DateRange | undefined

    $: dateRange
    
    $: maxProjectDuration = Math.max(...workSteps.map(step => step.latestFinish))

    $: xAxisTickValues = 
        maxProjectDuration > 365 * 2 ? d3.utcYears(projectStartDate, d3.utcDay.offset(projectStartDate, maxProjectDuration)) :
        maxProjectDuration > 30 * 4 ? d3.utcMonths(projectStartDate, d3.utcDay.offset(projectStartDate, maxProjectDuration)) :
        maxProjectDuration > 7 * 4 ? d3.utcMondays(projectStartDate, d3.utcDay.offset(projectStartDate, maxProjectDuration)) :
        d3.utcDays(projectStartDate, d3.utcDay.offset(projectStartDate, maxProjectDuration))
    
    $: xScale = d3.scaleLinear()
    .domain([0, maxProjectDuration])
    .range([0, width - margin.left - margin.right])
    
    $: yScale = d3.scaleBand()
    .domain(workSteps.map(step => step.name))
    .range([0, height - margin.top - margin.bottom])
    .padding(0.125)
    
    $: timeScale = d3.scaleTime()
    .domain([projectStartDate, d3.utcDay.offset(projectStartDate, maxProjectDuration)])
    .range([0, width - margin.left - margin.right])
    
    $: d3.select(gx)
        .call(
            d3.axisBottom(timeScale)
            .tickFormat(d => d3.utcFormat('%a %d %b %y')(d as Date))
            .tickValues(xAxisTickValues)
        )
        .selectAll('text')
        .attr('text-anchor', 'end')
        .attr('transform', 'rotate(-45)')
        .attr('dx', -8)
        
    $: d3.select(gy).call(d3.axisLeft(yScale).tickFormat(d => `${d.substring(0,4)}${d.length>5 ? '...' : ''}`))

    function overlappingValues<T>(arr1: T[], arr2: T[]) {
        return arr1.filter(val => arr2.includes(val))
    }

    function costCalculator(workSteps: WorkStep[], start: number, end: number, filter: 'earliest' | 'latest' | 'both') {
        const D3_RANGE_OFFSET = 1
        if (filter === 'both') return -1
        return workSteps
            .map(step => {
                if (filter === 'earliest') {
                    let stepRange = d3.range(step.earliestStart, step.earliestFinish + D3_RANGE_OFFSET)
                    let costDateRange = d3.range(start, end + D3_RANGE_OFFSET)
                    let overlap = overlappingValues(stepRange, costDateRange)
                    return overlap.length / stepRange.length * step.cost
                } else {
                    let stepRange = d3.range(step.latestStart, step.latestFinish + D3_RANGE_OFFSET)
                    let costDateRange = d3.range(start, end + D3_RANGE_OFFSET)
                    let overlap = overlappingValues(stepRange, costDateRange)
                    return overlap.length / stepRange.length * step.cost
                }
            })
            .reduce((a,c) => a + c, 0)
    }
</script>


<div class="m-0 px-4 py-2 flex items-center gap-2">
    <DropdownMenu.Root>
        <DropdownMenu.Trigger>
            <Button variant="outline" size="sm">
                {
                    filter === 'earliest' ? `Currently Showing: Project's Earliest Timeline` :
                    filter === 'latest' ? `Currently Showing: Project's Latest Timeline` :
                    `Choose A Filter To View Earliest or Latest Timelines`
                }
            </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
            <DropdownMenu.Label>Filter Gantt Chart</DropdownMenu.Label>
            <Separator />
            <DropdownMenu.RadioGroup bind:value={filter}>
                <DropdownMenu.RadioItem value="earliest">Earliest Timeline</DropdownMenu.RadioItem>
                <DropdownMenu.RadioItem value="latest">Latest Timeline</DropdownMenu.RadioItem>
                <DropdownMenu.RadioItem value="both">Both Timelines</DropdownMenu.RadioItem>
            </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
    </DropdownMenu.Root>
    <Popover.Root>
        <Popover.Trigger asChild let:builder>
          <Button
            variant="outline"
            size='sm'
            class={cn(
              "w-fit justify-start text-left font-normal",
              !calendarStartDate && "text-muted-foreground"
            )}
            builders={[builder]}
          >
            <CalendarIcon class="mr-2 h-4 w-4" />
            {calendarStartDate ? `Project Start: ${dateFormatterLong.format(calendarStartDate.toDate(getLocalTimeZone()))}` : "Pick a start date for the project"}
          </Button>
        </Popover.Trigger>
        <Popover.Content class="w-auto p-0">
          <Calendar bind:value={calendarStartDate} initialFocus />
        </Popover.Content>
    </Popover.Root>
    <div class="grid gap-2">
        <Popover.Root openFocus>
          <Popover.Trigger asChild let:builder>
            <Button
              variant="outline"
              size="sm"
              class={cn(
                "w-fit justify-start text-left font-normal",
                (dateRange.start === undefined && dateRange.end === undefined) && "text-muted-foreground"
              )}
              builders={[builder]}
            >
                <CalendarIcon class="mr-2 h-4 w-4" />
                {#if dateRange && dateRange.start}
                    {#if dateRange.end}
                        Cost From
                        {dateFormatterLong.format(dateRange.start.toDate(getLocalTimeZone()))} 
                        To
                        {dateFormatterLong.format(dateRange.end.toDate(getLocalTimeZone()))}
                    {/if}
                {:else if calendarCostStartDate}
                    {dateFormatterLong.format(calendarCostStartDate.toDate(getLocalTimeZone()))}
                {:else}
                    Pick a date range to view cost
                {/if}
            </Button>
          </Popover.Trigger>
          <Popover.Content class="w-auto p-0" align="start">
            <RangeCalendar
                bind:value={dateRange}
                bind:startValue={calendarCostStartDate}
                initialFocus
                numberOfMonths={2}
                minValue={calendarStartDate}
                maxValue={calendarStartDate ? calendarStartDate.add({ days: maxProjectDuration }) : undefined}
                placeholder={calendarStartDate ?? new CalendarDate(2024, 1, 1)}
                onValueChange={() => {
                    if (costDateRangeStart && costDateRangeEnd) {
                        console.log('here')
                        costInRange = costCalculator(
                            workSteps, 
                            xScale.invert(timeScale(costDateRangeStart)),
                            xScale.invert(timeScale(costDateRangeEnd)),
                            filter
                        )
                    }
                }}
            />
          </Popover.Content>
        </Popover.Root>
    </div>
</div>
<div class="mb-2 mx-4 border border-slate-500" id="chart-container" bind:clientWidth={width} bind:this={chartContainer}>
    <svg {width} {height} id="chart">
        <!-- Cost Range Selector -->
        <g transform={`translate(${margin.left} ${margin.top})`}>
            <g>
                <rect 
                    x={ costDateRangeStart ? timeScale(costDateRangeStart) : 0 }
                    width={ costDateRangeEnd && costDateRangeStart ? xScale(d3.utcDay.count(costDateRangeStart, costDateRangeEnd)) : 0 } 
                    y={0}
                    height={height - margin.top - margin.bottom}
                    opacity={0.5}
                    class="fill-green-500"
                >
                </rect>
                <text
                    x={ costDateRangeStart && costDateRangeEnd ? timeScale(costDateRangeStart) + ( xScale(d3.utcDay.count(costDateRangeStart, costDateRangeEnd))/2 ) : 0 }
                    y={ ((height - margin.top - margin.bottom) / 2) - 16 }
                    text-anchor="middle"
                    class="invisible"
                >
                    {dateRange.start ? dateFormatterShort.format(dateRange.start.toDate(getLocalTimeZone())) : '_'} - {dateRange.end ? dateFormatterShort.format(dateRange.end.toDate(getLocalTimeZone())) : '_'}
                </text>
                <text
                    x={ costDateRangeStart && costDateRangeEnd ? timeScale(costDateRangeStart) + ( xScale(d3.utcDay.count(costDateRangeStart, costDateRangeEnd))/2 ) : 0 }
                    y={ ((height - margin.top - margin.bottom) / 2) + 16 }
                    text-anchor="middle"
                    class="invisible"
                >
                    Cost: {costInRange >= 0 ? numberToRupiahConverter(costInRange) : 'Please choose a filter first'}
                </text>
            </g>
        </g>

        <!-- Gantt Chart -->
        <g transform={`translate(${margin.left} ${margin.top})`}>
            {#each workSteps as step}
            <g>
                {#if (filter === 'earliest' || filter === 'both')}
                <rect 
                    x={xScale(step.earliestStart)}
                    y={yScale(step.name)}
                    width={xScale(step.expectedTime)}
                    height={yScale.bandwidth()}
                    opacity=0.5
                    class:fill-red-500={step.isCritical}
                    class:fill-blue-500={!step.isCritical}
                />
                {/if}
                {#if (filter === 'latest' || filter === 'both')}
                <rect 
                    x={xScale(step.latestStart)}
                    y={yScale(step.name)}
                    width={xScale(step.expectedTime)}
                    height={yScale.bandwidth()}
                    opacity=0.5
                    class:fill-red-700={step.isCritical}
                    class:fill-blue-700={!step.isCritical}
                />    
                {/if}
                <text
                    x={ (xScale(step.earliestStart) + xScale(step.latestFinish)) / 2 }
                    y={ (yScale(step.name) ?? 0) + (yScale.bandwidth() / 2) - 8 }
                    text-anchor="middle"
                    class="invisible"
                >
                    {step.name}
                </text>
                <text
                    x={ (xScale(step.earliestStart) + xScale(step.latestFinish)) / 2 }
                    y={ (yScale(step.name) ?? 0) + (yScale.bandwidth() / 2) + 8 }
                    text-anchor="middle"
                    class="invisible"
                >
                    {numberToRupiahConverter(step.cost)}
                </text>
            </g>
            {/each}
        </g>

        <!-- Axes -->
        <g bind:this={gx} transform={`translate(${margin.left} ${height - margin.bottom})`}></g>
        <g bind:this={gy} transform={`translate(${margin.left} ${margin.top})`}></g>
    </svg>
</div>

<style lang="postcss">
    div svg#chart:hover g g rect {
        filter: blur(.0625rem);
        opacity: .33;
    }

    div svg#chart g g:hover {
        & rect:hover {
            filter: blur(0);
            opacity: .75;
        }

        & text {
            @apply visible font-bold;
        }
    }

    /* div svg#chart div:has(g g:hover) {
        z-index: 1;
    } */
</style>