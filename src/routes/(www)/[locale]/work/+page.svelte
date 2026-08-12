<script lang="ts">
	import { onMount } from 'svelte';
	import { localePath, toLocale } from '$lib/i18n';
	import { homeContent } from '$lib/marketing/content';

	let { data } = $props();
	const locale = $derived.by(() => toLocale(data.locale));
	const c = $derived.by(() => homeContent(locale));

	function formatDate(iso: string, loc: string): string {
		return new Date(iso).toLocaleDateString(loc === 'th' ? 'th-TH' : 'en-GB', {
			year: 'numeric',
			month: 'short',
		});
	}

	onMount(() => {
		if (new URLSearchParams(window.location.search).has('noanim')) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		let disposed = false;
		let mm: { revert: () => void } | undefined;
		(async () => {
			const [{ gsap }, { ScrollTrigger }] = await Promise.all([
				import('gsap'),
				import('gsap/ScrollTrigger'),
			]);
			if (disposed) return;
			gsap.registerPlugin(ScrollTrigger);
			gsap
				.timeline({ defaults: { ease: 'power4.out' } })
				.from('.work-hero > *', { y: 36, autoAlpha: 0, duration: 0.9, stagger: 0.1 }, 0.1);
			gsap.from('.case-card', {
				y: 56,
				autoAlpha: 0,
				duration: 0.8,
				ease: 'power3.out',
				stagger: 0.08,
				scrollTrigger: { trigger: '.case-grid', start: 'top 85%' },
			});
		})();
		return () => {
			disposed = true;
			mm?.revert();
		};
	});
</script>

<!-- ═══ PAGE HERO — one big statement, Ogilvy Work-page style ═══ -->
<section class="work-hero mx-auto max-w-7xl px-6 pt-20 pb-14 md:pt-28 md:pb-20">
	<p class="mb-4 text-xs font-medium tracking-[0.25em] uppercase text-[#4F65F1]">
		{c.worksKicker}
	</p>
	<h1
		class="display-font max-w-4xl text-4xl leading-[1.05] font-medium tracking-tight text-balance md:text-6xl"
	>
		{c.worksTitle}
	</h1>
</section>

<!-- ═══ CMS case studies (articles in the `work` category) ═══ -->
{#if data.caseStudies.length > 0}
	<section class="mx-auto max-w-7xl px-6 pb-8">
		<div class="case-grid grid gap-6 md:grid-cols-2">
			{#each data.caseStudies as article (article.id)}
				{@const loc = article.localizations[locale] ?? article.localizations.en}
				{#if loc}
					<a
						href={localePath(locale, `/updates/${article.slug}`)}
						class="case-card group rounded-2xl border border-[#181C38]/10 p-8 transition-shadow duration-300 hover:shadow-xl md:p-10"
					>
						<time class="text-xs tracking-[0.2em] text-[#181C38]/40 uppercase">
							{formatDate(article.publishedAt ?? article.createdAt, locale)}
						</time>
						<h2
							class="display-font mt-3 text-2xl font-medium tracking-tight text-balance transition-colors group-hover:text-[#4F65F1] md:text-3xl"
						>
							{loc.title}
						</h2>
						{#if loc.excerpt}
							<p class="mt-3 leading-relaxed text-[#181C38]/65">{loc.excerpt}</p>
						{/if}
						<span
							class="mt-5 inline-block text-sm font-semibold underline decoration-[#5AEDC5] decoration-2 underline-offset-4"
						>
							{locale === 'th' ? 'อ่านเคสนี้' : 'Read the case'} →
						</span>
					</a>
				{/if}
			{/each}
		</div>
	</section>
{/if}

<!-- ═══ The brands — static works as the permanent portfolio grid ═══ -->
<section class="mx-auto max-w-7xl px-6 pb-24 md:pb-32">
	<div class="case-grid grid gap-6 md:grid-cols-2">
		{#each c.works as work, i (work.key)}
			<article
				class="case-card group relative overflow-hidden rounded-2xl border border-[#181C38]/10 transition-shadow duration-300 hover:shadow-xl"
			>
				{#if work.image}
					<div class="overflow-hidden">
						<img
							src={work.image}
							alt={`${work.name} — ${work.tagline}`}
							class="aspect-[16/9] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
							loading={i < 2 ? 'eager' : 'lazy'}
						/>
					</div>
				{/if}
				<div class="p-8 md:p-10">
					<p class="text-xs font-medium tracking-[0.25em] text-[#181C38]/40 uppercase">
						{String(i + 1).padStart(2, '0')} — {work.name}
					</p>
					<h2
						class="display-font mt-2 text-2xl font-medium tracking-tight text-balance md:text-3xl"
					>
						{work.story}
					</h2>
					<p class="mt-1 text-sm font-medium" style={`color:${work.color}`}>{work.tagline}</p>
					<p class="mt-4 leading-relaxed text-[#181C38]/65">{work.description}</p>
					<p class="mt-5 text-xs tracking-wide text-[#181C38]/45 uppercase">
						{work.tags.join('  ·  ')}
					</p>
					{#if work.href}
						<a
							href={work.href}
							target="_blank"
							rel="noopener noreferrer"
							class="mt-5 inline-flex items-center gap-2 text-sm font-semibold underline decoration-2 underline-offset-4"
							style={`text-decoration-color:${work.color}`}
						>
							{locale === 'th' ? 'เยี่ยมชม' : 'Visit'} {work.name} ↗
						</a>
					{/if}
				</div>
			</article>
		{/each}
	</div>
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
