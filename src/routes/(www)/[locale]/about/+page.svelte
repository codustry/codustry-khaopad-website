<script lang="ts">
	import { onMount } from 'svelte';
	import { localePath, toLocale } from '$lib/i18n';
	import { aboutContent, homeContent, BRAND } from '$lib/marketing/content';

	let { data } = $props();
	const locale = $derived.by(() => toLocale(data.locale));
	const about = $derived.by(() => aboutContent(locale));
	const home = $derived.by(() => homeContent(locale));

	const tileColors = [BRAND.cyan, BRAND.pink, BRAND.indigo, BRAND.amber];

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

			// Opening statement: line-mask reveal, Ogilvy About gravitas.
			gsap.from('.statement-line-inner', {
				yPercent: 110,
				duration: 1.1,
				ease: 'power4.out',
				stagger: 0.12,
				delay: 0.15,
			});

			for (const el of gsap.utils.toArray<HTMLElement>('.chapter')) {
				gsap.from(el.children, {
					y: 44,
					autoAlpha: 0,
					duration: 0.85,
					ease: 'power3.out',
					stagger: 0.12,
					scrollTrigger: { trigger: el, start: 'top 80%' },
				});
			}
			gsap.from('.about-closing > *', {
				y: 40,
				autoAlpha: 0,
				duration: 0.85,
				ease: 'power3.out',
				stagger: 0.1,
				scrollTrigger: { trigger: '.about-closing', start: 'top 82%' },
			});
		})();
		return () => {
			disposed = true;
		};
	});
</script>

<!-- ═══ OPENING STATEMENT — the lesson, full-screen, ink on white ═══ -->
<section class="flex min-h-[70svh] items-center">
	<div class="mx-auto w-full max-w-6xl px-6 py-24">
		<p class="mb-8 text-xs font-medium tracking-[0.25em] uppercase text-[#4F65F1]">
			{locale === 'th' ? 'เกี่ยวกับเรา' : 'About us'}
		</p>
		<h1
			class="display-font text-4xl leading-[1.12] font-medium tracking-tight text-balance md:text-6xl lg:text-7xl"
		>
			{#each about.statement.split(' ') as word, i (i)}
				<span class="inline-block overflow-hidden align-bottom"
					><span class="statement-line-inner inline-block will-change-transform">{word}</span></span
				>{' '}
			{/each}
		</h1>
	</div>
</section>

<!-- ═══ THE STORY — chapters with diamond markers ═══ -->
<section class="mx-auto max-w-3xl px-6 pb-28 md:pb-36">
	{#each about.chapters as chapter, i (chapter.kicker)}
		<div class="chapter mt-16 first:mt-0 md:mt-20">
			<p class="mb-5 flex items-center gap-3 text-xs font-medium tracking-[0.25em] uppercase text-[#181C38]/50">
				<span
					class="inline-block h-2.5 w-2.5 rotate-45 rounded-[2px]"
					style={`background:${tileColors[i % tileColors.length]}`}
					aria-hidden="true"
				></span>
				{chapter.kicker}
			</p>
			{#each chapter.paragraphs as para, pi (pi)}
				<p
					class="display-font mt-5 text-xl leading-relaxed font-medium tracking-tight text-pretty text-[#181C38]/85 md:text-2xl"
				>
					{para}
				</p>
			{/each}
		</div>
	{/each}
</section>

<!-- ═══ PROOF — the same numbers, quiet ═══ -->
<section class="border-y border-[#181C38]/10">
	<div class="mx-auto grid max-w-7xl grid-cols-2 gap-10 px-6 py-16 md:grid-cols-4">
		{#each home.stats as stat (stat.label)}
			<div>
				<p class="display-font text-4xl font-medium md:text-5xl">
					{stat.prefix ?? ''}{stat.value}{stat.suffix}
				</p>
				<p class="mt-2 text-sm leading-snug text-[#181C38]/60">{stat.label}</p>
			</div>
		{/each}
	</div>
</section>

<!-- ═══ CLOSING CTA ═══ -->
<section class="about-closing mx-auto max-w-6xl px-6 py-24 text-center md:py-32">
	<h2 class="display-font text-3xl leading-tight font-medium tracking-tight text-balance md:text-5xl">
		{about.closing.headline}
	</h2>
	<a
		href={localePath(locale, about.closing.href)}
		class="mt-10 inline-flex items-center gap-2 rounded-full bg-[#181C38] px-8 py-4 font-medium text-white transition-colors hover:bg-[#181C38]/85"
	>
		{about.closing.cta}
		<span aria-hidden="true">→</span>
	</a>
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
