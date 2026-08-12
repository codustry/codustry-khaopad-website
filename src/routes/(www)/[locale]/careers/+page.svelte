<script lang="ts">
	import { onMount } from 'svelte';
	import * as m from '$lib/paraglide/messages';
	import { localePath, toLocale } from '$lib/i18n';
	import { homeContent, BRAND } from '$lib/marketing/content';

	let { data } = $props();
	const locale = $derived.by(() => toLocale(data.locale));
	const home = $derived.by(() => homeContent(locale));

	const accents = [BRAND.cyan, BRAND.pink, BRAND.indigo, BRAND.amber, BRAND.mint];

	function formatDate(iso: string | null, loc: string): string | null {
		if (!iso) return null;
		const d = new Date(iso);
		if (Number.isNaN(d.getTime())) return null;
		return d.toLocaleDateString(loc === 'th' ? 'th-TH' : 'en-GB', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	}

	onMount(() => {
		if (new URLSearchParams(window.location.search).has('noanim')) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		let disposed = false;
		(async () => {
			const [{ gsap }, { ScrollTrigger }] = await Promise.all([
				import('gsap'),
				import('gsap/ScrollTrigger'),
			]);
			if (disposed) return;
			gsap.registerPlugin(ScrollTrigger);
			gsap
				.timeline({ defaults: { ease: 'power4.out' } })
				.from('.careers-hero > *', { y: 36, autoAlpha: 0, duration: 0.9, stagger: 0.1 }, 0.1);
			gsap.from('.job-row', {
				y: 40,
				autoAlpha: 0,
				duration: 0.7,
				ease: 'power3.out',
				stagger: 0.08,
				scrollTrigger: { trigger: '.job-list', start: 'top 85%' },
			});
		})();
		return () => {
			disposed = true;
		};
	});
</script>

<!-- ═══ HERO ═══ -->
<section class="careers-hero mx-auto max-w-7xl px-6 pt-20 pb-12 md:pt-28 md:pb-16">
	<p class="mb-4 text-xs font-medium tracking-[0.25em] uppercase text-[#4F65F1]">
		{m.careers_kicker()}
	</p>
	<h1
		class="display-font max-w-4xl text-4xl leading-[1.05] font-medium tracking-tight text-balance md:text-6xl"
	>
		{m.careers_title()}
	</h1>
	<p class="mt-6 max-w-2xl text-lg leading-relaxed text-[#181C38]/65">{m.careers_intro()}</p>
</section>

<!-- ═══ OPENINGS ═══ -->
<section class="mx-auto max-w-7xl px-6 pb-24 md:pb-32">
	{#if data.jobs.length > 0}
		<ul class="job-list divide-y divide-[#181C38]/10 border-y border-[#181C38]/10">
			{#each data.jobs as job, i (job.id)}
				{@const meta = [
					job.department,
					job.category,
					job.employmentType,
					job.location,
				].filter(Boolean) as string[]}
				<li class="job-row group">
					<a
						href={job.applyUrl ?? localePath(locale, '/#contact')}
						target={job.applyUrl ? '_blank' : undefined}
						rel={job.applyUrl ? 'noopener noreferrer' : undefined}
						class="flex flex-col gap-4 py-8 transition-colors md:flex-row md:items-center md:gap-8"
					>
						<span
							class="hidden h-2.5 w-2.5 shrink-0 rotate-45 rounded-[2px] opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:block"
							style={`background:${accents[i % accents.length]}`}
							aria-hidden="true"
						></span>
						<div class="flex-1">
							<h2
								class="display-font text-2xl font-medium tracking-tight transition-transform duration-300 group-hover:translate-x-1 md:text-3xl"
							>
								{job.title}
							</h2>
							<p class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#181C38]/55">
								{#each meta as bit, mi (mi)}
									{#if mi > 0}<span aria-hidden="true">·</span>{/if}<span>{bit}</span>
								{/each}
								{#if job.salary}
									{#if meta.length > 0}<span aria-hidden="true">·</span>{/if}<span
										class="font-medium">{job.salary}</span
									>
								{/if}
							</p>
						</div>
						<span
							class="display-font shrink-0 text-sm font-semibold underline decoration-2 underline-offset-4"
							style={`text-decoration-color:${accents[i % accents.length]}`}
						>
							{m.careers_apply()} →
						</span>
					</a>
				</li>
			{/each}
		</ul>
		{#if data.stale}
			<p class="mt-6 text-xs text-[#181C38]/40">{m.careers_stale()}</p>
		{/if}
	{:else}
		<!-- Empty state: an open door, not a dead end. -->
		<div class="rounded-2xl border border-[#181C38]/10 p-10 md:p-16">
			<p class="display-font max-w-2xl text-xl leading-relaxed font-medium md:text-2xl">
				{m.careers_empty()}
			</p>
			<a
				href={`mailto:${home.contact.email}`}
				class="mt-8 inline-flex items-center gap-2 rounded-full bg-[#181C38] px-8 py-4 font-medium text-white transition-colors hover:bg-[#181C38]/85"
			>
				{m.careers_empty_cta()}
				<span aria-hidden="true">→</span>
			</a>
		</div>
	{/if}
</section>

<style>
	.display-font {
		font-family:
			'Space Grotesk',
			'IBM Plex Sans Thai',
			system-ui,
			sans-serif;
		letter-spacing: -0.02em;
	}
</style>
